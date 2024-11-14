from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import NewUser,SwipeAction
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer, UserSimilaritySerializer,SwipeActionSerializer
from .algorithm import filter_users
import logging
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

# Register View
class UserRegistrationView(generics.CreateAPIView):
    queryset = NewUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] 

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) 
        user = serializer.save() 
        return Response({
            "user": serializer.data,  
            "message": "User created successfully."
        }, status=status.HTTP_201_CREATED)

# Login View
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to login

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "message": "Login successful."
        }, status=status.HTTP_200_OK)


# User views
class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        # Return the authenticated user object directly
        return self.request.user 

# Similar views
class SimilarUsersView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSimilaritySerializer

    def get(self, request, *args, **kwargs):
        try:
            # Prepare current user's data for similarity filtering
            current_user = {
                'name':getattr(request.user, 'name', None),
                'email': getattr(request.user, 'email', None),
                'yourgender': getattr(request.user, 'yourgender', None),
                'gender': getattr(request.user, 'gender', None),
                'wakeUpTime': getattr(request.user, 'wakeUpTime', None),
                'bedTime': getattr(request.user, 'bedTime', None),
                'neatnessPreference': getattr(request.user, 'neatnessPreference', None),
                'pets': getattr(request.user, 'pets', None),
                'overnightGuests': getattr(request.user, 'overnightGuests', None),
                'moveInDate': request.user.moveInDate.strftime('%Y-%m-%d') if request.user.moveInDate else None,
                'moveOutDate': request.user.moveOutDate.strftime('%Y-%m-%d') if request.user.moveOutDate else None,
                'country': getattr(request.user, 'country', None),
                'state': getattr(request.user, 'state', None),
                'city': getattr(request.user, 'city', None),
                'dailyRoutine': getattr(request.user, 'dailyRoutine', None),
                'priorities': getattr(request.user, 'priorities', None),
                'homeSpaceUse': getattr(request.user, 'homeSpaceUse', None),
                'biggestStressors': getattr(request.user, 'biggestStressors', None),
                'worstHabit': getattr(request.user, 'worstHabit', None),
                'dealBreakers': getattr(request.user, 'dealBreakers', None),
                'confrontationStyle': getattr(request.user, 'confrontationStyle', None),
                'sundayNightActivity': getattr(request.user, 'sundayNightActivity', None),
                'roommateSelfAssessment': getattr(request.user, 'roommateSelfAssessment', None),
            }

            # Fetch similar users
            similar_users = filter_users(current_user)

            # Use a list comprehension to create the list of users
            similar_users_data = [
                {
                    'name': user.name,
                    'email': user.email,
                    'yourgender': user.yourgender,
                    'gender': user.gender,
                    'wakeUpTime': user.wakeUpTime,
                    'bedTime': user.bedTime,
                    'neatnessPreference': user.neatnessPreference,
                    'pets': user.pets,
                    'overnightGuests': user.overnightGuests,
                    'moveInDate': user.moveInDate.strftime('%Y-%m-%d') if user.moveInDate else None,
                    'moveOutDate': user.moveOutDate.strftime('%Y-%m-%d') if user.moveOutDate else None,
                    'country': user.country,
                    'state': user.state,
                    'city': user.city,
                    'dailyRoutine': user.dailyRoutine,
                    'priorities': user.priorities,
                    'homeSpaceUse': user.homeSpaceUse,
                    'biggestStressors': user.biggestStressors,
                    'worstHabit': user.worstHabit,
                    'dealBreakers': user.dealBreakers,
                    'confrontationStyle': user.confrontationStyle,
                    'sundayNightActivity': user.sundayNightActivity,
                    'roommateSelfAssessment': user.roommateSelfAssessment,
                    'similarity': similarity,
                    
                } for user, similarity in similar_users
            ]

            if not similar_users_data:
                return Response({
                    "similar_users": [],
                    "message": "No similar users found."
                }, status=status.HTTP_404_NOT_FOUND)

            serialized_data = self.get_serializer(similar_users_data, many=True).data
            
            return Response({
                "similar_users": serialized_data,
                "message": "Similar users retrieved successfully."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in SimilarUsersView: {e}", exc_info=True)
            return Response({"message": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SwipeActionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        decision = request.data.get('decision')
        serializer = SwipeActionSerializer(
            data=request.data,
            context={'decision': decision}
        )

        # Instead of using is_valid() directly, we can handle the creation logic within try-except
        try:
            serializer.is_valid(raise_exception=True)  # This will raise an exception if validation fails
            serializer.save()  # Only called if validation passes
            return Response({"message": "Swipe action logged successfully."}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            # Handle validation errors without raising another validation error
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Handle any other exceptions
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)