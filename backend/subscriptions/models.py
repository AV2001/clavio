from django.db import models
import uuid


class Subscriptions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_id = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    price_id = models.CharField(max_length=255, null=True, blank=True)
    max_chatbots = models.IntegerField(null=True, blank=True)
    max_pdfs = models.IntegerField(null=True, blank=True)
    max_pages_per_pdf = models.IntegerField(null=True, blank=True)
    max_url_links = models.IntegerField(null=True, blank=True)
    max_prompts_per_day = models.IntegerField(null=True, blank=True)
    max_retrains_per_month = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "subscriptions"


class OrganizationSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE
    )
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_subscription_item_id = models.CharField(
        max_length=255, null=True, blank=True
    )
    subscription_status = models.CharField(max_length=50, null=True, blank=True)
    subscription_start_date = models.DateTimeField(auto_now_add=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    subscription = models.ForeignKey(Subscriptions, on_delete=models.CASCADE)

    class Meta:
        db_table = "organization_subscription"
