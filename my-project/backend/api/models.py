from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings
from rest_framework.exceptions import ValidationError

class CustomAccountManager(BaseUserManager):

    def create_superuser(self, email, name, password, **other_fields):
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)

        if other_fields.get('is_staff') is not True:
            raise ValueError('Superuser must be assigned to is_staff=True.')
        if other_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must be assigned to is_superuser=True.')

        return self.create_user(email, name, password, **other_fields)

    def create_user(self, email, name, password, **other_fields):
        if not email:
            raise ValueError(_('You must provide an email address'))

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **other_fields)
        user.set_password(password)
        user.save()
        return user


class NewUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    dailyRoutine = models.TextField(blank=True)
    priorities = models.TextField(blank=True)
    wakeUpTime = models.TimeField(null=True, blank=True)
    bedTime = models.TimeField(null=True, blank=True)
    homeSpaceUse = models.TextField(blank=True)
    biggestStressors = models.TextField(blank=True)
    worstHabit = models.TextField(blank=True)
    dealBreakers = models.TextField(blank=True)
    NEATNESS_OPTIONS = [
        ('Very Neat', 'Very Neat'),
        ('Neat', 'Neat'),
        ('Somewhat Neat', 'Somewhat Neat'),
        ('Messy', 'Messy'),
    ]
    GUEST_OPTIONS = [
        ('Yes', 'Yes'),
        ('No', 'No'),
        ('Sometimes', 'Sometimes'),
    ]
    GENDER_OPTIONS = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Any', 'Any'),
    ]
    PET_OPTIONS = [
        ('Yes', 'Yes'),
        ('No', 'No'),
    ]
    YOUR_GENDER_OPTIONS = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    gender = models.CharField(max_length=100, choices=GENDER_OPTIONS, blank=True)
    yourgender = models.CharField(max_length=100, choices=YOUR_GENDER_OPTIONS, blank=True)
    neatnessPreference = models.CharField(max_length=100, choices=NEATNESS_OPTIONS, blank=True)
    overnightGuests = models.CharField(max_length=100, choices=GUEST_OPTIONS, default='No')
    pets = models.CharField(max_length=100, choices=PET_OPTIONS, default='No')
    confrontationStyle = models.CharField(max_length=100, blank=True)
    sundayNightActivity = models.TextField(blank=True)
    roommateSelfAssessment = models.TextField(blank=True)
    moveInDate = models.DateField(null=True, blank=True)
    moveOutDate = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    images = models.JSONField(default=list, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name or self.email  # Use email if name is not set
    
class AbstractSwipeAction(models.Model):
    """
    An abstract model to store swipe actions. 
    Records the swiped user, swiping user, and decision ('yes' or 'no').
    """
    swiped_by_email = models.EmailField()  # Email of the user who performed the swipe
    swiped_user_email = models.EmailField(default='default@example.com')
    decision = models.CharField(max_length=3)  # Store "yes" decisions only
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        unique_together = ('swiped_by_email', 'swiped_user_email')  # Prevents duplicate swipes

    def __str__(self):
        return f"{self.swiped_by_email} swiped {self.swiped_user_email} - {self.decision}"

# Extend the abstract model for actual usage in your application
class SwipeAction(models.Model):
    swiped_by = models.OneToOneField(
        NewUser,
        on_delete=models.CASCADE,
        related_name="swipe_action",
        unique=True
    )
    swiped_yes_emails = models.JSONField(default=list, blank=True)  # Stores list of emails this user swiped "yes" on

    def add_yes_swipe(self, swiped_user_email):
        """
        Add an email to the swiped_yes_emails list if not already present.
        """
        if swiped_user_email not in self.swiped_yes_emails:
            self.swiped_yes_emails.append(swiped_user_email)
            self.save()
        else:
            raise ValidationError(f"{swiped_user_email} has already been swiped 'yes' by {self.swiped_by.email}.")

    def __str__(self):
        return f"{self.swiped_by.email} - Yes Swipes: {len(self.swiped_yes_emails)}"

    class Meta:
        unique_together = ('swiped_by',)