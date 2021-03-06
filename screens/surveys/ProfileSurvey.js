import * as React from 'react';
import firebase from '../../Firebase.js'
import h from '../../globals';
import { StyleSheet, Text, View, Button } from 'react-native';
import Form from '../../components/quiz/Form';
import Loading from '../Loading';
import { AuthContext } from '../../AuthContext.js';
import { AppContext } from '../../AppContext.js';
import { RFValue } from 'react-native-responsive-fontsize';
import AppIcons from '../../components/AppIcons.js';

export default function ProfileSurvey(props) {
  const user = React.useContext(AuthContext);
  const hitpause = React.useContext(AppContext);
  const [isLoading, setIsLoading] = React.useState(true);
  const [surveyComplete, setSurveyComplete] = React.useState(false);
  const [quiz, setQuiz] = React.useState({});

  React.useEffect(() => {
    // Get survey config from firebase
    firebase.database().ref(`hitpause/quizzes/initialAssessment`).once('value').then(s => {
      let quizData = s.val();
      let questionList = quizData.questions;
      if (!quizData.dynamic) {
        let sortedQuestionList = Object.values(questionList).sort((a, b) => a.order - b.order);
        quizData.questions = sortedQuestionList.slice();
      }
      setQuiz(quizData);
      setIsLoading(false);
    })
  }, []);

  async function handleSubmit(effects) {
    let data = {};
    // For each object in the effects array
    for (const key in effects) {
      // For each property in the flag object, add it to the data object
      for (const traitFlag in effects[key]) data[traitFlag] = effects[key][traitFlag];
    }
    user.ref.child('profile/traits').set(data);
    setSurveyComplete(true);
  }

  if (isLoading) return <Loading message="Loading your quiz..."></Loading>;
  else {
    return (
      <View style={styles.container}>
        {
          !surveyComplete ? (
            <View>
              <Form quiz={quiz} onSubmit={handleSubmit}></Form>
            </View>
          ) : (
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <View style={ styles.endCard }>
                <Text>You're all set up! We'll use this information to tailor our suggestions to you.</Text>
              </View>
            </View>
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00095e',
    paddingTop: RFValue(20)
  },
  endCard: {
    backgroundColor: '#fff',
    borderRadius: RFValue(20),
    overflow: 'hidden',
    padding: RFValue(10),
    height: RFValue(160)
  }
});
