import * as React from 'react';
import {Text, View, StyleSheet} from 'react-native';

import QuizQuestion from './QuizQuestion'

import Response_Checkbox from './Response_Checkbox';
import Response_Radio from './Response_Radio';
import Response_Scale from './Response_Scale';
import Response_Text from './Response_Text';
import Response_TextArea from './Response_TextArea';


export default class QuizCard extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    let responseComponent;
    if(this.props.quiz.questions[this.props.quizIndex].type == "checkbox"){
      responseComponent = <Response_Checkbox response={this.props.quiz.questions[this.props.quizIndex].responses}></Response_Checkbox>
    }
    else if(this.props.quiz.questions[this.props.quizIndex].type == "radio"){
      responseComponent = <Response_Radio response={this.props.quiz.questions[this.props.quizIndex].responses}></Response_Radio>
    }
    else if(this.props.quiz.questions[this.props.quizIndex].type == "scale"){
      responseComponent = <Response_Scale></Response_Scale>
    }
    else if(this.props.quiz.questions[this.props.quizIndex].type == "text"){
      responseComponent = <Response_Text></Response_Text>
    }
    else if(this.props.quiz.questions[this.props.quizIndex].type == "textarea"){
      responseComponent = <Response_TextArea></Response_TextArea>
    }
    return(
      <View style={styles.card}>
        <QuizQuestion text={this.props.quiz.questions[this.props.quizIndex].text}></QuizQuestion>
        {responseComponent}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  card:{
    backgroundColor: "#FFF5F5",
    width: "80vw",
    alignSelf: "center",
    height: "40vh"
  }
});