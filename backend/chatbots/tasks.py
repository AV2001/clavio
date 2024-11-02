import logging
from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .train import train_with_files, train_with_urls
from .models import Chatbot


logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def train_chatbot_task(self, chatbot_id, training_method, files=None, urls=None):
    logger.info(f"Started training chatbot {chatbot_id}")
    channel_layer = get_channel_layer()

    try:
        # Send initial status
        async_to_sync(channel_layer.group_send)(
            f"chatbot_{chatbot_id}",
            {
                "type": "chatbot_status",
                "message": {
                    "status": "training",
                    "message": "Started training the chatbot...",
                },
            },
        )

        chatbot = Chatbot.objects.get(id=chatbot_id)
        org_name = chatbot.organization.name

        # Update progress periodically
        async_to_sync(channel_layer.group_send)(
            f"chatbot_{chatbot_id}",
            {
                "type": "chatbot_status",
                "message": {
                    "status": "training",
                    "message": "Processing data...",
                },
            },
        )

        if training_method == "files":
            response = train_with_files(files, org_name)
        elif training_method == "urls":
            response = train_with_urls(urls, org_name)

        if response["status"] == 200:
            chatbot.status = "live"
            chatbot.save()

            async_to_sync(channel_layer.group_send)(
                f"chatbot_{chatbot_id}",
                {
                    "type": "chatbot_status",
                    "message": {
                        "status": "live",
                        "message": "Training completed successfully!",
                    },
                },
            )
            return {"status": "success"}
        else:
            raise Exception(response["message"])

    except Exception as e:
        logger.error(f"Training failed for chatbot {chatbot_id}: {str(e)}")
        chatbot = Chatbot.objects.get(id=chatbot_id)
        chatbot.status = "failed"
        chatbot.save()

        async_to_sync(channel_layer.group_send)(
            f"chatbot_{chatbot_id}",
            {
                "type": "chatbot_status",
                "message": {
                    "status": "failed",
                    "message": "Training failed!",
                },
            },
        )

        raise self.retry(exc=e, countdown=2**self.request.retries)
