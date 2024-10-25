from django.urls import path
from .views import ChatbotView, ChatbotEmbedScriptView

urlpatterns = [
    path("", ChatbotView.as_view(), name="chatbots"),
    path('embed/<uuid:embed_id>.js', ChatbotEmbedScriptView.as_view(), name='chatbot_embed_script'),
]
