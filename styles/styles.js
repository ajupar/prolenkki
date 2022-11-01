import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Dimensions } from 'react-native';

const Styles = StyleSheet.create({
  addExerciseFAB: {
    position: 'absolute',
    margin: 24,
    right: 0,
    bottom: 0,
    backgroundColor: 'green'
  },
  recordExerciseFAB: {
    position: 'absolute',
    margin: 24,
    right: 70,
    bottom: 0,
    backgroundColor: 'green'
  },
  authFormContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Constants.statusBarHeight,
  },
  button: {
    height: 50,
    width: 150,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'red'
  },
  buttonText: {
    fontSize: 16,
    alignSelf: 'center',
    color: '#fff',
  },
  buttonTextSmall: {
    fontSize: 14,
    alignSelf: 'center',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerExercisesView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  createAccountButton: {
    margin: 10,
  },
  createAccountText: {
    paddingTop: 40,
    paddingLeft: 10,
  },
  dbEntryStyle: {
    marginLeft: 5,
    // paddingLeft: 5,
    fontSize: 14,
  },
  dbEntrySubtitleStyle: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold'
  },
  errorMsg: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    height: 40,
  },
  errorText: {
    fontSize: 10,
    color: 'grey',
  },
  errorTextAddExerciseScreen: {
    fontSize: 10,
    color: 'red',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5
  },
  formInput: {
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    borderColor: 'grey',
    borderWidth: 0.2,
  },
  formInputAddExercise: {
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 15,
    borderColor: 'grey',
    borderWidth: 0.2,
    height: 40,
  },
  formInputAddExerciseDate: {
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 15,
    borderColor: 'grey',
    borderWidth: 0.2,
    height: 40,
  },
  formInputAddExerciseFlex4: {
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 15,
    borderColor: 'grey',
    borderWidth: 0.2,
    height: 40,
    flex: 4,
  },
  formInputLogin: {
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 30,
    borderColor: 'grey',
    borderWidth: 0.2,
  },
  logoutButton: {
    margin: 10,
    height: 50,
    backgroundColor: 'darkgrey',
    justifyContent: 'center',
    alignContent: 'center'
  },
  map: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  removeAccountButton: {
    margin: 10,
    height: 50,
    backgroundColor: 'grey',
    justifyContent: 'center',
  },
  regularText: {
    fontSize: 14,
  },
  smallInputButtonFlex1: {
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 15,
    height: 40,
    backgroundColor: 'green',
    justifyContent: 'center',
    flex: 1,
  },
  submitButton: {
    margin: 10,
    height: 50,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignContent: 'center'
  },


});


export default Styles;


