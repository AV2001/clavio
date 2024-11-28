# from django.conf import settings
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework.authentication import CSRFCheck
# from rest_framework import exceptions


# def enforce_csrf(request):
#     # Create a dummy get_response function
#     def dummy_get_response(request):
#         return None

#     check = CSRFCheck(dummy_get_response)
#     check.process_request(request)
#     reason = check.process_view(request, None, (), {})
#     if reason:
#         raise exceptions.PermissionDenied("CSRF Failed: %s" % reason)


# class CustomJWTAuthentication(JWTAuthentication):
#     def authenticate(self, request):
#         print("👇👇👇👇👇👇")
#         print("This is inside the authenticate method in CustomJWTAuthentication!")
#         header = self.get_header(request)
#         print(header)

#         if header is None:
#             raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"]) or None
#         else:
#             raw_token = self.get_raw_token(header)
#         if raw_token is None:
#             return None

#         validated_token = self.get_validated_token(raw_token)
#         enforce_csrf(request)
#         return self.get_user(validated_token), validated_token
