from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import NewUser,SwipeAction

class UserAdminConfig(UserAdmin):
    model = NewUser
    search_fields = ('email', 'name', 'country', 'state', 'city','moveInDate', 'moveOutDate','gender')  # Allow search by these fields
    list_filter = ('email', 'name', 'state', 'city', 'country', 'is_active', 'is_staff','moveInDate', 'moveOutDate','neatnessPreference', 'overnightGuests','pets','gender')  # Filters
    ordering = ('-moveInDate',)  # Order by move-in date
    list_display = ('email', 'name', 'state', 'city', 'country', 'is_active', 'is_staff','moveInDate', 'moveOutDate','gender')  # Display in list view
    
    # Defining what fields should appear in the form, categorized by sections
    fieldsets = (
        (None, {'fields': ('email', 'password')}),  # Basic information
        (_('Personal Info'), {
            'fields': (
                'name', 'age', 'dailyRoutine', 'priorities', 'wakeUpTime', 'bedTime', 
                'homeSpaceUse', 'biggestStressors', 'worstHabit', 'dealBreakers',
                'neatnessPreference', 'overnightGuests', 'confrontationStyle','pets','gender','yourgender',
                'sundayNightActivity', 'roommateSelfAssessment', 
                'moveInDate', 'moveOutDate', 'country', 'state', 'city', 'images'
            )}),  # Personal details section
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff')
        }),  # Permissions section
    )
    
    # Fields to display when adding a user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'is_active', 'is_staff')}
        ),
    )

admin.site.register(NewUser, UserAdminConfig )
class SwipeActionAdmin(admin.ModelAdmin):
    list_display = ('swiped_by', 'get_swiped_yes_emails')  # Display the swiping user and the emails swiped "yes"
    search_fields = ('swiped_by__email',)  # Allow searching by the swiping user's email

    def get_swiped_yes_emails(self, obj):
        """
        Custom method to display swiped 'yes' emails as a comma-separated string.
        """
        return ', '.join(obj.swiped_yes_emails) if obj.swiped_yes_emails else 'None'
    
    get_swiped_yes_emails.short_description = 'Swiped Yes Emails'  # Set column name in admin

admin.site.register(SwipeAction, SwipeActionAdmin)
