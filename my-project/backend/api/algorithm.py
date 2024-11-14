from datetime import datetime, timedelta  # Make sure timedelta is imported
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import NewUser

def calculate_similarity_tfidf(current_user, filtered_users):
    # Prepare texts for TF-IDF
    current_user_text = " ".join([
        current_user.get('dailyRoutine', ''),
        current_user.get('priorities', ''),
        current_user.get('homeSpaceUse', ''),
        current_user.get('biggestStressors', ''),
        current_user.get('worstHabit', ''),
        current_user.get('dealBreakers', ''),
        current_user.get('confrontationStyle', ''),
        current_user.get('sundayNightActivity', ''),
        current_user.get('roommateSelfAssessment', '')
    ])

    filtered_users_texts = [
        " ".join([
            user.dailyRoutine,
            user.priorities,
            user.homeSpaceUse,
            user.biggestStressors,
            user.worstHabit,
            user.dealBreakers,
            user.confrontationStyle,
            user.sundayNightActivity,
            user.roommateSelfAssessment
        ]) for user in filtered_users
    ]

    # Check if there are any filtered users
    if not filtered_users_texts:
        return []

    # Combine current user text with filtered users' texts for TF-IDF
    all_texts = [current_user_text] + filtered_users_texts

    # Calculate TF-IDF embeddings
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    # Compute cosine similarity
    current_user_vector = tfidf_matrix[0]  # First vector corresponds to current_user
    user_vectors = tfidf_matrix[1:]         # Remaining vectors correspond to other users

    # Calculate cosine similarity between current_user and each other user
    similarities = cosine_similarity(current_user_vector, user_vectors).flatten()
    
    # Pair users with their similarity scores
    user_similarity = list(zip(filtered_users, similarities))

    # Sort users based on similarity score (highest to lowest)
    user_similarity.sort(key=lambda x: x[1], reverse=True)

    return user_similarity

def filter_users(current_user):
    hour_range = timedelta(hours=1)
    two_weeks_range = timedelta(weeks=2)

    # Get all users from the database, excluding the current user
    all_users = NewUser.objects.exclude(email=current_user.get('email'))  
    filtered_users = []
    filtered_out_users_info = []  # List to collect info about filtered out users
    passed_users_info = []  # List to collect info about users who passed the filters

    # Display logged-in user information
    print(f"Logged-in user: {current_user['email']}, Gender: {current_user['gender']}, "
          f"Wake Up Time: {current_user.get('wakeUpTime')}, Bed Time: {current_user.get('bedTime')}, "
          f"Neatness Preference: {current_user['neatnessPreference']}, Pets: {current_user['pets']}, "
          f"Overnight Guests: {current_user['overnightGuests']}, Move In Date: {current_user.get('moveInDate')}, "
          f"Move Out Date: {current_user.get('moveOutDate')}, Location: {current_user['city']}, "
          f"{current_user['state']}, {current_user['country']}")

    for user in all_users:
        # Gender preference filter
        if current_user['gender'] == 'any':
            if user.gender != 'any' and user.gender != current_user['gender']:
                filtered_out_users_info.append({
                    'user': user.email,
                    'reason': 'Gender preference mismatch'
                })
                continue
        else:
            if user.yourgender != current_user['yourgender'] or (user.gender != 'any' and user.yourgender != current_user['gender']):
                filtered_out_users_info.append({
                    'user': user.email,
                    'reason': 'Gender preference mismatch'
                })
                continue

        # Wake-up time filter within 1-hour range
        if current_user.get('wakeUpTime') and user.wakeUpTime:
            current_user_wake_up_time = (
                datetime.strptime(current_user['wakeUpTime'], '%H:%M').time() 
                if isinstance(current_user['wakeUpTime'], str) 
                else current_user['wakeUpTime']
            )
            user_wake_up_time = (
                datetime.strptime(user.wakeUpTime, '%H:%M').time() 
                if isinstance(user.wakeUpTime, str) 
                else user.wakeUpTime
            )

            if abs((datetime.combine(datetime.today(), current_user_wake_up_time) - 
                     datetime.combine(datetime.today(), user_wake_up_time)).total_seconds()) > hour_range.total_seconds():
                filtered_out_users_info.append({
                    'user': user.email,
                    'reason': 'Wake-up time mismatch'
                })
                continue

        # Bedtime filter within 1-hour range
        if current_user.get('bedTime') and user.bedTime:
            current_user_bed_time = (
                datetime.strptime(current_user['bedTime'], '%H:%M').time() 
                if isinstance(current_user['bedTime'], str) 
                else current_user['bedTime']
            )
            user_bed_time = (
                datetime.strptime(user.bedTime, '%H:%M').time() 
                if isinstance(user.bedTime, str) 
                else user.bedTime
            )

            if abs((datetime.combine(datetime.today(), current_user_bed_time) - 
                     datetime.combine(datetime.today(), user_bed_time)).total_seconds()) > hour_range.total_seconds():
                filtered_out_users_info.append({
                    'user': user.email,
                    'reason': 'Bedtime mismatch'
                })
                continue

        # Neatness preference filter
        if current_user['neatnessPreference'] != user.neatnessPreference:
            filtered_out_users_info.append({
                'user': user.email,
                'reason': 'Neatness preference mismatch'
            })
            continue

        # Pets filter
        if (current_user['pets'] == 'yes' and user.pets != 'yes') or \
           (current_user['pets'] == 'no' and user.pets != 'no'):
            filtered_out_users_info.append({
                'user': user.email,
                'reason': 'Pet preference mismatch'
            })
            continue

        # Overnight guests filter
        if (current_user['overnightGuests'] == 'yes' and user.overnightGuests not in ['yes', 'sometimes']) or \
           (current_user['overnightGuests'] == 'no' and user.overnightGuests != 'no') or \
           (current_user['overnightGuests'] == 'sometimes' and user.overnightGuests == 'no'):
            filtered_out_users_info.append({
                'user': user.email,
                'reason': 'Overnight guests preference mismatch'
            })
            continue

        # Move-in and move-out date filters within 2-week range
        if current_user.get('moveInDate') and user.moveInDate:
            current_user_move_in_date = (
                datetime.strptime(current_user['moveInDate'], '%Y-%m-%d').date() 
                if isinstance(current_user['moveInDate'], str) 
                else current_user['moveInDate']
            )
            user_move_in_date = (
                datetime.strptime(user.moveInDate, '%Y-%m-%d').date() 
                if isinstance(user.moveInDate, str) 
                else user.moveInDate
            )
            if abs((current_user_move_in_date - user_move_in_date).days) > two_weeks_range.days:
                filtered_out_users_info.append({
                    'user': user.email,
                    'reason': 'Move-in date mismatch'
                })
                continue

        if current_user.get('moveOutDate') and user.moveOutDate:
            current_user_move_out_date = (
                datetime.strptime(current_user['moveOutDate'], '%Y-%m-%d').date() 
                if isinstance(current_user['moveOutDate'], str) 
                else current_user['moveOutDate']
            )
            user_move_out_date = (
                datetime.strptime(user.moveOutDate, '%Y-%m-%d').date() 
                if isinstance(user.moveOutDate, str) 
                else user.moveOutDate
            )
            if abs((current_user_move_out_date - user_move_out_date).days) > two_weeks_range.days:
                filtered_out_users_info.append({
                    'user': user.email,
                    'reason': 'Move-out date mismatch'
                })
                continue

        # Country, state, and city filters
        if (current_user['country'] != user.country or 
            current_user['state'] != user.state or 
            current_user['city'] != user.city):
            filtered_out_users_info.append({
                'user': user.email,
                'reason': 'Location mismatch'
            })
            continue
        
        # If all checks pass, add the user to the filtered list
        filtered_users.append(user)
        # Collect info about passed users
        passed_users_info.append({
            'user': user.email,
            'attributes': {
                'email': user.email,  # Added email to the passed user attributes
                'gender': user.gender,
                'wakeUpTime': user.wakeUpTime,
                'bedTime': user.bedTime,
                'neatnessPreference': user.neatnessPreference,
                'pets': user.pets,
                'overnightGuests': user.overnightGuests,
                'moveInDate': user.moveInDate,
                'moveOutDate': user.moveOutDate,
                'country': user.country,
                'state': user.state,
                'city': user.city,
            }
        })

    # After filtering, calculate similarity based on the filtered users
    user_similarity = calculate_similarity_tfidf(current_user, filtered_users)

    # Print filtered out users info for debugging
    for info in filtered_out_users_info:
        print(f"Filtered out user: {info['user']} - Reason: {info['reason']}")

  
    # Print passed users info for debugging, now including similarity score
    for user, similarity in user_similarity:
    # Find the corresponding attributes from passed_users_info
        user_info = next((info for info in passed_users_info if info['user'] == user.email), None)
        if user_info:
            print(f"Passed user: {user_info['user']} - Attributes: {user_info['attributes']} - Similarity: {similarity:.4f}")


    return user_similarity  # Returns users sorted by similarity based on text similarity
