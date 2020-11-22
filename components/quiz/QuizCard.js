import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import firebase from '../../Firebase';

import Response_Checkbox from './Response_Checkbox';
import Response_Radio from './Response_Radio';
import Response_Scale from './Response_Scale';
import Response_Text from './Response_Text';
import Response_TextArea from './Response_TextArea';
import { Portal, Modal } from 'react-native-paper';
import { RFValue } from "react-native-responsive-fontsize";
import { ScrollView } from 'react-native';
import { AppContext } from '../../AppContext';
import SuggestionSwitcher from './SuggestionSwitcher';
import AppIcons from '../AppIcons';
import Swiper from 'react-native-swiper';

export default class QuizCard extends React.Component {

  constructor(props) {
    super(props);
    this.handleNextQuestion = this.handleNextQuestion.bind(this);
    this.handlePrevQuestion = this.handlePrevQuestion.bind(this);
    this.state = {
      quizIndex: 0,
      quizLength: Array.isArray(this.props.quiz.questions) ? this.props.quiz.questions.length : 0,
      quizData: [],
      quizFlags: [],
      questionScore: '',
      nextDisabled: false,
      prevDisabled: true,   // Start on first question by default
      modalVisible: false
    }
  }

  // Updates data for quiz when a response is selected or changes
  updateQuizData = (data, flags) => {
    this.setState((state) => {
      // TODO: Restrucutre to just use keys and not score
      let dataUpdate = [...state.quizData];
      let flagUpdate = [...state.quizFlags];
      dataUpdate[state.quizIndex] = data;
      flagUpdate[state.quizIndex] = flags;
      return { quizData: dataUpdate, quizFlags: flagUpdate };
    });
    console.log(data, flags);
  }

  handleNextQuestion = () => {
    // If not at end of quiz
    if (this.state.quizIndex < this.state.quizLength - 1) {
      let newIndex = this.state.quizIndex + 1;
      this.setState({
        quizIndex: newIndex,
        // Always re-enable previous button when moving forward
        prevDisabled: false
      });
      // If at end of quiz ('next' button will submit)
    } else if (this.state.quizIndex == this.state.quizLength - 1) {
      // Sanitize input data
      for (const key in this.state.quizData) {
        if (typeof this.state.quizData[key] === 'undefined') this.state.quizData[key] = '';
      }

      let outputFlags = this.tallyOutputFlags();
      let topThree = this.getHighsAndLows(outputFlags, 3, 0)[0];
      console.log('outputFlags:', outputFlags);
      console.log('topThree:', topThree);

      let suggestion = this.randomizeSuggestions(topThree);
      console.log(suggestion);
      this.setState({ outputSuggestion1: this.context.suggestions[suggestion[0]] });
      this.setState({ outputSuggestion2: this.context.suggestions[suggestion[1]] });
      this.setState({ outputSuggestion3: this.context.suggestions[suggestion[2]] });
      this.setState({ modalVisible: true });

      firebase.database()
        .ref(`users/${firebase.auth().currentUser.uid}/profile/quizHistory/${this.props.quizName}`)
        .push({
          suggestion: suggestion,
          timestamp: Date.now(),
          responses: this.state.quizData,
          outputFlags: outputFlags
        });
    }
  }

  tallyOutputFlags() {
    let flags = {};
    let modifiers = [];
    // Get flag changes
    for (const key in this.state.quizFlags) {
      for (const flagKey in this.state.quizFlags[key]) {
        // Flag has a special behavior
        if (flagKey.includes('_highest_')) {
          let count = parseInt(flagKey.replace('_highest_', ''));
          modifiers.push({ type: 'high', count: count, amount: parseFloat(this.state.quizFlags[key][flagKey]) });
        } else if (flagKey.includes('_lowest_')) {
          let count = parseInt(flagKey.replace('_lowest_', ''));
          modifiers.push({ type: 'low', count: count, amount: parseFloat(this.state.quizFlags[key][flagKey]) });

          // Flags of this type already exist, will sum
        } else if (Object.keys(flags).includes(flagKey)) {
          flags[flagKey] = parseFloat(flags[flagKey]) + parseFloat(this.state.quizFlags[key][flagKey]);
          // Otherwise, add normally
        } else {
          flags[flagKey] = parseFloat(this.state.quizFlags[key][flagKey]);
        }
      }
    }

    // For all of our special cases
    for (const key in modifiers) {
      let modifiedFlags = {};
      // Depending on type of case, grab relevant flags
      if (modifiers[key].type == 'high') {
        modifiedFlags = this.getHighsAndLows(flags, modifiers[key].count, 0)[0];
      } else if (modifiers[key].type == 'low') {
        modifiedFlags = this.getHighsAndLows(flags, 0, modifiers[key].count)[1];
      }
      // Apply changes to those flags
      for (const flagKey in modifiedFlags) {
        modifiedFlags[flagKey] = modifiedFlags[flagKey] + modifiers[key].amount;
      }
      flags = { ...flags, ...modifiedFlags };
    }
    return flags;
  }

  // TODO: Incomplete... will probably want to move this into summary screen
  // TODO: Ties are unfair, as lower keys will always be chosen... need a way to randomly select when there are ties
  getHighsAndLows(flags, numHighs, numLows) {
    let highValues = [], lowValues = [];
    let sortedFlags = Object.entries(flags).sort((a, b) => (a[1] < b[1]));
    if (numHighs > 0) {
      highValues = sortedFlags.slice(0, numHighs);
    }
    if (numLows > 0) {
      lowValues = sortedFlags.slice(sortedFlags - 1 - numLows, sortedFlags.length - 1);
    }
    return [Object.fromEntries(highValues), Object.fromEntries(lowValues)];
  }

  // getRandomizedSuggestion(flags) {
  //   let n = 0;
  //   for (const key in flags) {
  //     let squaredDoubleFlag = (flags[key] * 2) ** 2;
  //     flags[key] = squaredDoubleFlag + n;
  //     n = squaredDoubleFlag + n;
  //   }
  //   let randomInt = Math.floor(Math.random() * n);
  //   for (const key in flags) {
  //     if (flags[key] > randomInt) return key;
  //   }
  //   return null;
  // }

  randomizeSuggestions(flags) {
    let n = 0;
    for (const key in flags) {
      let squaredDoubleFlag = (flags[key] * 2) ** 2;
      flags[key] = squaredDoubleFlag + n;
      n = squaredDoubleFlag + n;
    }
    let randomInt = Math.floor(Math.random() * n);
    for (const key in flags) {
      if (flags[key] > randomInt) {
        delete flags[key];
        // TODO: Verify this actually works correctly
        let remainingKeys = Object.keys(flags).length > 0 ? this.randomizeSuggestions(flags) : [];
        return [key, ...remainingKeys];
      };
    }
    return null;
  }

  handlePrevQuestion() {
    let newIndex = this.state.quizIndex - 1;
    this.setState({ quizIndex: newIndex });
    if (newIndex == 0) this.setState({ prevDisabled: true })
  }

  handleButtonDisable() {
    if (buttonDisabled == true) {
      this.setState({ buttonDisabled: false })
    } else if (buttonDisabled == false) {
      this.setState({ buttonDisabled: false })
    }
  }

  render() {
    let responseComponent;
    let buttonDisabled = true;
    if (this.props.quiz.questions[this.state.quizIndex].type == "checkbox") {
      responseComponent =
        <Response_Checkbox
          responses={this.props.quiz.questions[this.state.quizIndex].responses}
          onChange={this.updateQuizData}
          value={this.state.quizData[this.state.quizIndex]}
        ></Response_Checkbox>
    }
    else if (this.props.quiz.questions[this.state.quizIndex].type == "radio") {
      responseComponent =
        <Response_Radio
          responses={this.props.quiz.questions[this.state.quizIndex].responses}
          onChange={this.updateQuizData}
          value={this.state.quizData[this.state.quizIndex]}
        ></Response_Radio>
    }
    else if (this.props.quiz.questions[this.state.quizIndex].type == "scale") {
      responseComponent =
        <Response_Scale
          flagChanges={this.props.quiz.questions[this.state.quizIndex].flagChanges}
          scaleLow={this.props.quiz.questions[this.state.quizIndex].scaleLow}
          scaleHigh={this.props.quiz.questions[this.state.quizIndex].scaleHigh}
          onChange={this.updateQuizData}
          value={this.state.quizData[this.state.quizIndex]}
        ></Response_Scale>
      buttonDisabled = false;
    }
    else if (this.props.quiz.questions[this.state.quizIndex].type == "text") {
      responseComponent = <Response_Text></Response_Text>
      buttonDisabled = false;
    }
    else if (this.props.quiz.questions[this.state.quizIndex].type == "textarea") {
      responseComponent = <Response_TextArea></Response_TextArea>
      buttonDisabled = false;
    }
    return (
      <View style={styles.container}>

        <View style={styles.quizQuestion}>
          <Text style={styles.questionNumber}>{this.props.quiz.questions[this.state.quizIndex].order}</Text>
          <Text style={styles.questionText}>{this.props.quiz.questions[this.state.quizIndex].text}</Text>
        </View>

        <ScrollView style={{flexGrow: 1}}>
          {responseComponent}
        </ScrollView>

        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handlePrevQuestion}
            disabled={this.state.prevDisabled}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleNextQuestion}
            disabled={this.state.nextDisabled}
          >
            <Text style={styles.buttonText}>{this.state.quizIndex == this.state.quizLength - 1 ? 'Submit' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
        <Portal>
          <Modal visible={this.state.modalVisible} 
                 dismissible={false} 
                 contentContainerStyle={styles.resultsModal}
                 >
          <Swiper style={styles.wrapper} showsButtons loop={false}>
            <View testID="Suggestion1" style={styles.slide1}> 
            <Text style={styles.modalHeader}>Results</Text>
            <Text style={styles.modalText}>{!!this.state.outputSuggestion1 ? this.state.outputSuggestion1.text : ""}</Text>
            <Text style={{ textAlign: 'center' }}>
              {!!this.state.outputSuggestion1 && <AppIcons name={this.state.outputSuggestion1.icon} />}
            </Text>
            <Text style={styles.modalText}>{!!this.state.outputSuggestion1 ? this.state.outputSuggestion1.body : ""}</Text>
            <SuggestionSwitcher suggestionId={this.state.outputSuggestion1}></SuggestionSwitcher>
            {/* <SpotifySuggestions></SpotifySuggestions> */}
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                this.setState({ modalVisible: false });
                this.props.navigation.navigate('Home');
              }}>
                <Text style={styles.modalText}>Close</Text>
              </TouchableOpacity>
            </View>
            </View>

            <View testID="Suggestion2" style={styles.slide2}> 
            <Text style={styles.modalHeader}>Results</Text>
            <Text style={styles.modalText}>{!!this.state.outputSuggestion2 ? this.state.outputSuggestion2.text : ""}</Text>
            <Text style={{ textAlign: 'center' }}>
              {!!this.state.outputSuggestion2 && <AppIcons name={this.state.outputSuggestion2.icon} />}
            </Text>
            <Text style={styles.modalText}>{!!this.state.outputSuggestion2 ? this.state.outputSuggestion2.body : ""}</Text>
            <SuggestionSwitcher suggestionId={this.state.outputSuggestion2}></SuggestionSwitcher>
            {/* <SpotifySuggestions></SpotifySuggestions> */}
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                this.setState({ modalVisible: false });
                this.props.navigation.navigate('Home');
              }}>
                <Text style={styles.modalText}>Close</Text>
              </TouchableOpacity>
            </View>
            </View>

            <View testID="Suggestion3" style={styles.slide3}> 
            <Text style={styles.modalHeader}>Results</Text>
            <Text style={styles.modalText}>{!!this.state.outputSuggestion3 ? this.state.outputSuggestion3.text : ""}</Text>
            <Text style={{ textAlign: 'center' }}>
              {!!this.state.outputSuggestion3 && <AppIcons name={this.state.outputSuggestion3.icon} />}
            </Text>
            <Text style={styles.modalText}>{!!this.state.outputSuggestion3 ? this.state.outputSuggestion3.body : ""}</Text>
            <SuggestionSwitcher suggestionId={this.state.outputSuggestion3}></SuggestionSwitcher>
            {/* <SpotifySuggestions></SpotifySuggestions> */}
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => {
                this.setState({ modalVisible: false });
                this.props.navigation.navigate('Home');
              }}>
                <Text style={styles.modalText}>Close</Text>
              </TouchableOpacity>
            </View>
            </View>
            </Swiper>  
          </Modal>
        </Portal>
      </View>
    );
  }
}

QuizCard.contextType = AppContext;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1
  },
  text: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  scrollView: {

  },
  resultsModal: {
    backgroundColor: '#132090',
    justifyContent: 'center',
    alignContent: 'center',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
    bottom: 10,
    margin: 30,
    flex:1
  },
  modalHeader: {
    textAlign: 'center',
    padding: 10,
    fontFamily: 'Poppins-Light',
    fontSize: 25,
    color: 'white'
  },
  modalText: {
    padding: 15,
    fontFamily: 'Poppins-Extra-Light',
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    backgroundColor: '#00095e',
    borderRadius: 8,
    width: RFValue(80),
  },
  quizQuestion: {
    flexDirection: 'column',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: '80%',
  },
  button: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    overflow: 'hidden',
    height: RFValue(30),
    width: RFValue(120),
    marginLeft: 20,
    marginRight: 20,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center'
  },
  controlButtons: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'center',
    margin: 20
  },
  questionText:{
    color: '#00095e',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  questionNumber: {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#00095e',
    borderRadius: 100,
    paddingHorizontal: 4,
    fontWeight: 'bold'
  },
  wrapper: {
  },
  slide1: {
    flex: 1,
    width:'80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#132090',
    left:'10%'
  },
  slide2: {
    flex: 1,
    width:'80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#132090',
    left:'10%'
  },
  slide3: {
    flex: 1,
    width:'80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#132090',
    left:'10%'
  },
});

