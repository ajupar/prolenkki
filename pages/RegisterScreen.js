import React, { useState } from 'react'
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
import Styles from '../styles/styles';
import { Button } from 'react-native-paper';
import { auth } from '../components/firebase';

// https://medium.com/swlh/lets-create-mobile-app-with-react-native-and-firebase-6967a7946408
// https://www.freecodecamp.org/news/build-forms-in-react-with-react-hook-form-library/
// https://reactnative.dev/docs/textinput

// Salasanan ja sähköpostin validointi
//  https://stackoverflow.com/questions/52733019/react-native-display-validation-errors-inline
// https://medium.com/@react.ui.kit/react-native-textinput-validation-using-regex-patterns-rules-d811e8eee9aa
// https://blog.bitsrc.io/a-beginners-guide-to-regular-expressions-regex-in-javascript-9c58feb27eb4
// https://www.reddit.com/r/learnprogramming/comments/1rb507/can_you_have_multiple_conditions_in_a_regex_has/


const RegisterScreen = ({ navigation }) => {

    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    const [registerEmailIsValid, setRegisterEmailIsValid] = useState(false);
    const [registerPasswordIsValid, setRegisterPasswordIsValid] = useState(false);
    const [registerConfirmPasswordIsValid, setRegisterConfirmPasswordIsValid] = useState(false);

    // väh. 1 merkki + @ + väh. 1 merkki + . + väh. 1 merkki
    var emailReg = /^.+@.+\..+$/;
    // 1) vähintään yksi numero, 2) vähintään yksi iso kirjain, 3) vähintään 6 merkkiä pitkä
    var passwordReg = /^(?=.*\d)(?=.*[A-Z])(?=.{6,}).*$/;

    const checkEmailIsValid = (val) => {
        if (emailReg.test(val)) {
            setRegisterEmailIsValid(true);
        } else {
            setRegisterEmailIsValid(false);
        }
    }

    const checkPasswordIsValid = (val) => {
        if (passwordReg.test(val)) {
            setRegisterPasswordIsValid(true)
        } else {
            setRegisterPasswordIsValid(false)
        }
    }

    const checkConfirmPasswordIsValid = (val) => {
        if (val === registerPassword) {
            setRegisterConfirmPasswordIsValid(true)
        } else {
            setRegisterConfirmPasswordIsValid(false)
        }
    }

    const handleRegisterClick = () => {
        console.log(registerEmail, ' ', registerPassword, ' ', registerConfirmPassword);

        if (!registerEmailIsValid || !registerPasswordIsValid || !registerConfirmPasswordIsValid) {
            // asiakaspuolen validointia ekassa if-lohkossa
            // ilmoitetaan virheilmoitukset järkevässä järjestyksessä isoin ongelma edellä
            if (!registerEmailIsValid) {
                Alert.alert("Virhe", "Virheellinen sähköpostiosoite.")
            } else if (!registerPasswordIsValid) {
                Alert.alert("Virhe", "Liian heikko salasana.")
            } else if (!registerConfirmPasswordIsValid) {
                Alert.alert("Virhe", "Syötä sama salasana kahteen kertaan.")
            }

        } else {
            // const { registerEmail, registerPassword } = data;
            auth
                .createUserWithEmailAndPassword(
                    registerEmail.trim().toLowerCase(), registerPassword
                ).catch(error => {
                    // serveripuolen validointia catch-lohkossa
                    console.log('catch block')
                    let ecode = error.code;
                    let msg = '';
                    switch (ecode.substr(5)) {
                        case "invalid-email":
                            msg = "Virheellinen sähköpostiosoite.";
                            break;
                        case "weak-password":
                            msg = "Liian heikko salasana.";
                            break;
                        case "email-already-in-use":
                            msg = "Käyttäjätunnus on jo rekisteröity."
                            break;
                        default:
                            msg = error.message;
                            break;
                    }

                    console.log(ecode.substr(5))

                    Alert.alert("Virhe", msg)

                });
        }
    }

    const EmailErrorField = ({ emailErrorFieldValid }) => {
        if (emailErrorFieldValid) {
            return (
                <View style={Styles.errorMsg}>
                    <Text></Text>
                </View>
            );
        } else {
            return (
                <View style={Styles.errorMsg}>
                    <Text style={Styles.errorText}>Syötä sähköpostiosoite (nimi@tunnus.pääte). Osoitteen ei tarvitse olla oikea.</Text>
                </View>
            );
        }
    }

    const PasswordErrorField = ({ passwordErrorFieldValid }) => {
        if (passwordErrorFieldValid) {
            return (
                <View style={Styles.errorMsg}>
                    <Text></Text>
                </View>
            );
        } else {
            return (
                <View style={Styles.errorMsg}>
                    <Text style={Styles.errorText}>Vähintään 6 merkkiä pitkä salasana, jossa numeroita ja isoja kirjaimia</Text>
                </View>
            );
        }
    }

    const ConfirmPasswordErrorField = ({ confirmPasswordErrorFieldValid }) => {
        if (confirmPasswordErrorFieldValid) {
            return (
                <View style={Styles.errorMsg}>
                    <Text></Text>
                </View>
            );
        } else {
            return (
                <View style={Styles.errorMsg}>
                    <Text style={Styles.errorText}>Syötä sama salasana uudestaan</Text>
                </View>
            );
        }
    }

    const LogInComponent = ({ navigation }) => {
        return (
            <View>
                <Text style={Styles.createAccountText}>
                    Onko sinulla jo käyttäjätili?
                </Text>

                <Button
                    mode='outlined'
                    style={Styles.createAccountButton}
                    labelStyle={{ color: 'green' }}
                    icon='account-plus'
                    compact
                    onPress={() => navigation.goBack()}
                >Kirjaudu sisään</Button>
            </View>
        );
    }


    // Sivun renderöinti
    return (
        <SafeAreaView style={Styles.authFormContainer}>
            <TextInput
                style={Styles.formInput}
                placeholder='Sähköposti'
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => {
                    setRegisterEmail(text);
                    checkEmailIsValid(text)
                }}
                value={registerEmail}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />

            {(registerEmailIsValid || registerEmail.length == 0) ? <EmailErrorField emailErrorFieldValid={true} /> : <EmailErrorField emailErrorFieldValid={false} />}

            <TextInput
                style={Styles.formInput}
                placeholder='Salasana'
                secureTextEntry={true}
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => {
                    setRegisterPassword(text)
                    checkPasswordIsValid(text)
                }}
                value={registerPassword}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />

            {(registerPasswordIsValid || registerPassword.length == 0) ? <PasswordErrorField passwordErrorFieldValid={true} /> : <PasswordErrorField passwordErrorFieldValid={false} />}

            <TextInput
                style={Styles.formInput}
                placeholder='Vahvista salasana'
                secureTextEntry={true}
                placeholderTextColor="#aaaaaa"
                onChangeText={(text) => {
                    setRegisterConfirmPassword(text)
                    checkConfirmPasswordIsValid(text)
                }}
                value={registerConfirmPassword}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
            />

            {(registerConfirmPasswordIsValid || registerConfirmPassword.length == 0) ? <ConfirmPasswordErrorField confirmPasswordErrorFieldValid={true} /> : <ConfirmPasswordErrorField confirmPasswordErrorFieldValid={false} />}

            <TouchableOpacity
                style={Styles.submitButton}
                onPress={() => handleRegisterClick()}>
                <Text style={Styles.buttonText}>Luo tili</Text>
            </TouchableOpacity>

            <LogInComponent navigation={navigation} />

        </SafeAreaView>
    )
};

export default RegisterScreen;