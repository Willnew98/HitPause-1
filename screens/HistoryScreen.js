import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import firebase from '../Firebase';
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import albumImage from '../assets/images/album-placeholder.png';
import { AuthContext } from '../AuthContext';
import { AppContext } from '../AppContext';
import StarRating from 'react-native-star-rating';
import AppIcons from '../components/AppIcons';

export default function HistoryScreen(props) {
  const user = React.useContext(AuthContext);
  const hitpause = React.useContext(AppContext);
  const [userSuggestions, setUserSuggestions] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [currentReview, setCurrentReview] = React.useState(null);

  React.useEffect(() => {
    // On component load, query firebase for the user's suggestions
    firebase.database().ref(`users/${user.uid}/profile/quizHistory/incidentQuestionnaire`).on('value', (s) => {
      // Get the response from the firebase query, set the id attribute, and set the userSuggestions var
      let allUserSuggestions = s.val() || {};
      for (const key in allUserSuggestions) allUserSuggestions[key].id = key;
      setUserSuggestions(Object.values(allUserSuggestions));
    });
  }, []);

  function handleRatingChanged(id, rating) {
    // Update the suggestion's rating
    firebase.database().ref(`users/${user.uid}/profile/quizHistory/incidentQuestionnaire/${id}`).update({
      starRating: rating
    });
    setCurrentReview({...currentReview, starRating: rating});
  }

  // TODO: move to utility class
  function getDateAndTime(epoch) {
    let date = new Date(epoch);
    let dateString = `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).substr(2)}`;
    let timeString = `${date.getHours() == 0 ? '12' : (date.getHours() % 12)}:${String(date.getMinutes()).padStart(2, '0')}`;
    let amPmString = date.getHours() < 12 ? 'AM' : 'PM';
    return `${dateString}\n${timeString} ${amPmString}`;
  }

  function reviewSuggestion(id) {
    // Find the review by its id, add some more information, and set currentReview
    let review = userSuggestions[userSuggestions.findIndex(s => s.id == id)];
    review.fullSuggestion = hitpause.suggestions[review.suggestion];
    review.id = id;
    setCurrentReview(review);
    setVisible(true);
  }

  function removeSuggestion(){
    setVisible(false);
    if(currentReview.starRating >= 0.5){

    }
  }

  function renderSuggestion({ item }) {
    // Render a button for a specific suggestion
    let suggestion = hitpause.suggestions[item.suggestion] || {};
    return (
      <TouchableOpacity style={styles.suggestionBlock} onPress={() => reviewSuggestion(item.id)}>
        <Text style={styles.smallText}>{suggestion.text}</Text>
        <Text style={{textAlign: 'center'}}>
          {!!suggestion.icon && <AppIcons name={suggestion.icon} size={36} color="black" />}
        </Text>
        <Text style={styles.smallText}>{getDateAndTime(item.timestamp)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header2}>History</Text>
      <ScrollView>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Give these suggestions a review!</Text>
          <FlatList
            data={userSuggestions}
            renderItem={renderSuggestion}
            horizontal={true}
            keyExtractor={item => item.id}
          />
          <TouchableOpacity>
            <Text style={styles.text}>View More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Recent Suggestions</Text>
          <View style={styles.recentTab}>
            <Image source={albumImage} style={styles.albumImages}></Image>
            <Image source={albumImage} style={styles.albumImages}></Image>
            <Image source={albumImage} style={styles.albumImages}></Image>
          </View>
          <TouchableOpacity>
            <Text style={styles.text}>View More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Recently Liked Suggestions</Text>
          <View style={styles.recentTab}>
            <Image source={albumImage} style={styles.albumImages}></Image>
            <Image source={albumImage} style={styles.albumImages}></Image>
            <Image source={albumImage} style={styles.albumImages}></Image>
          </View>
          <TouchableOpacity>
            <Text style={styles.text}>View More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.header}>Most Frequent Suggestions</Text>
          <View style={styles.recentTab}>
            <Image source={albumImage} style={styles.albumImages}></Image>
            <Image source={albumImage} style={styles.albumImages}></Image>
            <Image source={albumImage} style={styles.albumImages}></Image>
          </View>
          <TouchableOpacity>
            <Text style={styles.text}>View More</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <Portal>
        {
          !!currentReview &&
          <Modal visible={visible} onDismiss={removeSuggestion} contentContainerStyle={styles.reviewModal}>
            <Text style={styles.modalText}>{currentReview.fullSuggestion.text}</Text>
            <Text style={styles.modalText}>Leave a review!</Text>
            <StarRating
              disabled={false}
              maxStars={5}
              rating={currentReview.starRating}
              selectedStar={(rating) => handleRatingChanged(currentReview.id, rating)}
              fullStarColor={'white'}
              starStyle={styles.starRating}
              starSize={30}
            />
          </Modal>
        }
      </Portal>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00095e',
    flex: 1
  },
  header2: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: '5%',
    marginTop: '7.8%'
  },
  header: {
    padding: 15,
    fontFamily: 'Poppins-Extra-Light',
    fontSize: 20,
    color: 'white'
  },
  imgBackground: {
    width: '100%',
    height: '20%'
  },
  recentTab: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  reviewModal:{
    backgroundColor: '#132090',
    justifyContent: 'center',
    alignContent: 'center',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
    bottom: 10,
    margin: 30,
  },
  modalText:{
    padding: 15,
    fontFamily: 'Poppins-Extra-Light',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  albumImages: {
    borderRadius: 8,
    width: 100,
    height: 100,
  },
  buttonContainer: {
    margin: 10,
    padding: 10
  },
  textContainer: {
    backgroundColor: '#132090',
    marginBottom: 20,
  },
  button: {
    marginBottom: 20,
    backgroundColor: '#132090',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Extra-Light',
    padding: 15
  },
  suggestionBlock: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#fff',
    //padding: 10,
    margin: 10
  },
  smallText: {
    fontSize: 10,
    color: '#333',
    alignSelf: 'center',
    textAlign: 'center',
    padding: 5
    
  },
  starRating: {
    
  },

});