import React, { useState } from 'react'
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
import Styles from '../styles/styles';
import { Button } from 'react-native-paper';
import firebase, { auth, Persistence } from '../components/firebase';

// https://medium.com/swlh/lets-create-mobile-app-with-react-native-and-firebase-6967a7946408
// https://www.freecodecamp.org/news/build-forms-in-react-with-react-hook-form-library/
// https://reactnative.dev/docs/textinput

// Salasanan ja sähköpostin validointi
//  https://stackoverflow.com/questions/52733019/react-native-display-validation-errors-inline
// https://medium.com/@react.ui.kit/react-native-textinput-validation-using-regex-patterns-rules-d811e8eee9aa
// https://blog.bitsrc.io/a-beginners-guide-to-regular-expressions-regex-in-javascript-9c58feb27eb4
// https://www.reddit.com/r/learnprogramming/comments/1rb507/can_you_have_multiple_conditions_in_a_regex_has/


const LoginScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // const [emailIsValid, setEmailIsValid] = useState(false);
    // const [passwordIsValid, setPasswordIsValid] = useState(false);

    // väh. 1 merkki + @ + väh. 1 merkki + . + väh. 1 merkki
    // var emailReg = /^.+@.+\..+$/;
    // 1) vähintään yksi numero, 2) vähintään yksi iso kirjain, 3) vähintään 6 merkkiä pitkä
    // var passwordReg = /^(?=.*\d)(?=.*[A-Z])(?=.{6,}).*$/;

    // const checkEmailIsValid = (val) => {
    //     if (emailReg.test(val)) {
    //         setEmailIsValid(true);
    //     } else {
    //         setEmailIsValid(false);
    //     }
    // }

    // const checkPasswordIsValid = (val) => {
    //     if (passwordReg.test(val)) {
    //         setPasswordIsValid(true)
    //     } else {
    //         setPasswordIsValid(false)
    //     }
    // }

    const handleLoginClick = () => {
        console.log(email, ' ', password);

        // const { email, password } = data;
        // https://firebase.google.com/docs/auth/web/auth-state-persistence

        auth.signInWithEmailAndPassword(
            email.trim().toLowerCase(), password
        ).catch(error => {
            console.log('catch block')
            let ecode = error.code;
            let msg = '';
            switch (ecode.substr(5)) {
                case 'invalid-email':
                    msg = "Virheellinen sähköpostiosoite.";
                    break;
                case "wrong-password":
                    msg = "Väärä salasana.";
                    break;
                case "user-not-found":
                    msg = "Käyttäjää ei ole olemassa.";
                    break;
                default:
                    msg = error.message;
                    break;
            }

            console.log(ecode.substr(5))

            Alert.alert("Virhe", msg)

        });
    }

    // const EmailErrorField = ({ emailErrorFieldValid }) => {
    //     if (emailErrorFieldValid) {
    //         return (
    //             <View style={Styles.errorMsg}>
    //                 <Text></Text>
    //             </View>
    //         );
    //     } else {
    //         return (
    //             <View style={Styles.errorMsg}>
    //                 <Text style={Styles.errorText}>Syötä toimiva sähköpostiosoite (nimi@tunnus.com)</Text>
    //             </View>
    //         );
    //     }
    // }

    // const PasswordErrorField = ({ passwordErrorFieldValid }) => {
    //     if (passwordErrorFieldValid) {
    //         return (
    //             <View style={Styles.errorMsg}>
    //                 <Text></Text>
    //             </View>
    //         );
    //     } else {
    //         return (
    //             <View style={Styles.errorMsg}>
    //                 <Text style={Styles.errorText}>Vähintään 6 merkkiä pitkä salasana, jossa numeroita ja isoja kirjaimia</Text>
    //             </View>
    //         );
    //     }
    // }

    const CreateAccountComponent = ({ navigation }) => {
        return (
            <View>
                <Text style={Styles.createAccountText}>
                    Eikö sinulla ole käyttäjätiliä?
                </Text>

                <Button
                    mode='outlined'
                    style={Styles.createAccountButton}
                    labelStyle={{ color: 'green' }}
                    icon='account-plus'
                    compact
                    onPress={() => navigation.navigate('register')}
                >Luo tili</Button>
            </View>
        );
    }


    // Sivun renderöinti
    return (
        <SafeAreaView style={Styles.authFormContainer}>
            <TextInput
                style={Styles.formInputLogin}
                placeholder='Sähköposti'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => {
                    setEmail(text);
                    // checkEmailIsValid(text)
                }}
                value={email}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />

            {/* {(emailIsValid || email.length == 0) ? <EmailErrorField emailErrorFieldValid={true} /> : <EmailErrorField emailErrorFieldValid={false} />} */}

            <TextInput
                style={Styles.formInputLogin}
                placeholder='Salasana'
                secureTextEntry={true}
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => {
                    setPassword(text)
                    // checkPasswordIsValid(text)
                }}
                value={password}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />

            {/* {(passwordIsValid || password.length == 0) ? <PasswordErrorField passwordErrorFieldValid={true} /> : <PasswordErrorField passwordErrorFieldValid={false} />} */}


            <TouchableOpacity
                style={Styles.submitButton}
                onPress={() => handleLoginClick()}>
                <Text style={Styles.buttonText}>Kirjaudu sisään</Text>
            </TouchableOpacity>

            <CreateAccountComponent navigation={navigation} />

        </SafeAreaView>
    )
};

export default LoginScreen;