import os

# gemini ai
import google.generativeai as genai

# rest framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

# models
from .models import Chat

# serializers
from .serializers import ChatSerializer

# gemini key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])


class ChatCreateView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ChatSerializer 

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]

        # gemini model config
        generation_config = {
            "temperature": 0.9,
            "top_p": 1,
            "top_k": 1,
            "max_output_tokens": 4096,
        }

        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
        ]

        model = genai.GenerativeModel(
            model_name="gemini-pro",
            generation_config=generation_config,
            safety_settings=safety_settings,
        )

        # generate response
        response = model.generate_content([prompt])
        generated_response = response.text.strip()

        if isinstance(response, str):
            return Response(
                {
                "status": "error",
                "prompt": generated_response,
                }
                ,status=status.HTTP_400_BAD_REQUEST,
            )
        
        return Response(
            {
            "status": "success",
            "prompt": generated_response,
            "message": "Chat created successfully!"
            },
            status=status.HTTP_201_CREATED,
        )


