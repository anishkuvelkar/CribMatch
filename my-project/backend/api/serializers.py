from rest_framework import serializers as drf_serializers
from rest_framework.exceptions import ValidationError  # Correct import for ValidationError
from .models import NewUser, SwipeAction

class UserRegistrationSerializer(drf_serializers.ModelSerializer):
    password = drf_serializers.CharField(write_only=True)

    class Meta:
        model = NewUser
        fields = [
            'email', 'name', 'password', 'age', 'dailyRoutine', 
            'priorities', 'wakeUpTime', 'bedTime', 'homeSpaceUse', 'gender',
            'biggestStressors', 'worstHabit', 'dealBreakers', 'yourgender',
            'neatnessPreference', 'overnightGuests', 'confrontationStyle', 
            'pets', 'sundayNightActivity', 'roommateSelfAssessment', 
            'moveInDate', 'moveOutDate', 'country', 'state', 
            'city', 'images'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def create(self, validated_data):
        images = validated_data.get('images', [])
        if images is None:
            images = []  # Set to empty list if None
        user = NewUser(
            email=validated_data['email'],
            name=validated_data['name'],
            pets=validated_data['pets'],
            age=validated_data.get('age'),
            gender=validated_data.get('gender', ''),
            yourgender=validated_data.get('yourgender', ''),
            dailyRoutine=validated_data.get('dailyRoutine', ''),
            priorities=validated_data.get('priorities', ''),
            wakeUpTime=validated_data.get('wakeUpTime'),
            bedTime=validated_data.get('bedTime'),
            homeSpaceUse=validated_data.get('homeSpaceUse', ''),
            biggestStressors=validated_data.get('biggestStressors', ''),
            worstHabit=validated_data.get('worstHabit', ''),
            dealBreakers=validated_data.get('dealBreakers', ''),
            neatnessPreference=validated_data.get('neatnessPreference', ''),
            overnightGuests=validated_data.get('overnightGuests', False),
            confrontationStyle=validated_data.get('confrontationStyle', ''),
            sundayNightActivity=validated_data.get('sundayNightActivity', ''),
            roommateSelfAssessment=validated_data.get('roommateSelfAssessment', ''),
            moveInDate=validated_data.get('moveInDate'),
            moveOutDate=validated_data.get('moveOutDate'),
            country=validated_data.get('country', ''),
            state=validated_data.get('state', ''),
            city=validated_data.get('city', ''),
            images=images
        )
        user.set_password(validated_data['password'])  # Hash the password
        user.save()
        return user

class UserLoginSerializer(drf_serializers.Serializer):
    email = drf_serializers.EmailField()
    password = drf_serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            try:
                user = NewUser.objects.get(email=email)
            except NewUser.DoesNotExist:
                raise drf_serializers.ValidationError("User with this email does not exist.")
            
            if not user.check_password(password):
                raise drf_serializers.ValidationError("Incorrect password.")
        else:
            raise drf_serializers.ValidationError("Must include 'email' and 'password'.")

        attrs['user'] = user
        return attrs
    
class UserProfileSerializer(drf_serializers.ModelSerializer):
     class Meta:
        model = NewUser
        fields = [
            'email', 'name', 'age', 'dailyRoutine', 'priorities', 'gender',
            'wakeUpTime', 'bedTime', 'homeSpaceUse', 'biggestStressors', 'yourgender',
            'worstHabit', 'dealBreakers', 'neatnessPreference', 'overnightGuests', 
            'confrontationStyle', 'pets', 'sundayNightActivity', 'roommateSelfAssessment', 'yourgender',
            'moveInDate', 'moveOutDate', 'country', 'state', 'city', 'images'
        ]
        
class UserSimilaritySerializer(drf_serializers.ModelSerializer):
    similarity = drf_serializers.FloatField()  

    class Meta:
        model = NewUser
        fields = [ 'email', 'name', 'age', 'dailyRoutine', 'priorities', 'gender',
            'wakeUpTime', 'bedTime', 'homeSpaceUse', 'biggestStressors', 'yourgender',
            'worstHabit', 'dealBreakers', 'neatnessPreference', 'overnightGuests', 
            'confrontationStyle', 'pets', 'sundayNightActivity', 'roommateSelfAssessment', 'yourgender',
            'moveInDate', 'moveOutDate', 'country', 'state', 'city', 'images','similarity']
        
class SwipeActionSerializer(drf_serializers.ModelSerializer):
    swiped_by_email = drf_serializers.EmailField()
    swiped_user_email = drf_serializers.EmailField()

    class Meta:
        model = SwipeAction
        fields = ['swiped_by_email', 'swiped_user_email']

    def validate(self, data):
        # Log the incoming payload data for validation
        print("Payload data received for validation:", data)

        # Ensure the decision is "yes" only
        if self.context.get('decision') != "yes":
            print("Decision is not 'yes'; raising validation error.")
            raise drf_serializers.ValidationError("Only 'yes' decisions are processed.")
        
        print("Payload validated successfully.")
        return data

    def create(self, validated_data):
        # Log the validated data before creation
        print("Validated data for creating SwipeAction:", validated_data)

        try:
            # Fetch the user from NewUser model
            swiped_by_user = NewUser.objects.get(email=validated_data['swiped_by_email'])
            # Log the found user
            print(f"User found for swiped_by_email {validated_data['swiped_by_email']}:", swiped_by_user)

            # Create or get the SwipeAction instance
            swipe_action, _ = SwipeAction.objects.get_or_create(swiped_by=swiped_by_user)
            # Log the SwipeAction instance
            print("SwipeAction instance retrieved or created:", swipe_action)

            # Add the "yes" swipe email to the list
            swipe_action.add_yes_swipe(validated_data['swiped_user_email'])
            print(f"Added {validated_data['swiped_user_email']} to yes swipes for user {swiped_by_user.email}")

            return swipe_action
        except NewUser.DoesNotExist:
            print(f"User with email {validated_data['swiped_by_email']} does not exist.")
            raise drf_serializers.ValidationError("User not found for the given swiped_by_email.")
        except Exception as e:
            print("An error occurred during SwipeAction creation:", str(e))
            raise drf_serializers.ValidationError(f"An error occurred: {str(e)}")