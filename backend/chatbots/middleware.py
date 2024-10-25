class ChatbotFrameMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/api/chatbots/chatbot-embed/"):
            # Remove X-Frame-Options header if it exists
            response.headers.pop('X-Frame-Options', None)
            # Set Content-Security-Policy to allow embedding from any origin
            response['Content-Security-Policy'] = "frame-ancestors *"
        return response
