import React, { useState } from "react";
import { Text, View, TextInput, Button, Alert, MaskedViewComponent, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { FAB } from 'react-native-paper';
import firebase from 'firebase';
import { auth, db } from "../components/firebase";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateParser from '../components/DateParser';

import Styles from '../styles/styles';

// https://react-hook-form.com/get-started#ReactNative

// Hook Formin syötteen validointi regexillä: käytä parametria rules = { pattern: regex }
// https://react-hook-form.com/api/usecontroller/controller


const AddExerciseScreen = ({ navigation }) => {

    const { control, handleSubmit, formState: { errors } } = useForm();

    const [datePickerDate, setDatePickerDate] = useState(new Date());
    const [datePickerMode, setDatePickerMode] = useState('date');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || datePickerDate;
        setShowDatePicker(Platform.OS === 'ios');
        setDatePickerDate(currentDate);
    };

    const showDateMode = (currentMode) => {
        setShowDatePicker(true);
        setDatePickerMode(currentMode);
    };

    const showDatePickerMethod = () => {
        showDateMode('date');
    };

    const showTimePicker = () => {
        showDateMode('time');
    };


    // Vähintään yksi numero. Jos desimaalimerkki (, tai .), niin oltava 1-3 desimaalinumeroa
    var exerciseLengthRegex = /^[0-9]+((,|.)[0-9]{1,3})?$/;
    // Vähintään yksi merkki
    var exerciseNameRegex = /^.+$/;

    // lenkin lisäys tietokantaan
    const onSubmit = async (data) => {
        console.log('onSubmit ', data);

        const user = auth.currentUser;

        // var temp_day = new Date().getDate();
        // var temp_month = new Date().getMonth() + 1;
        // var temp_year = new Date().getFullYear();
        // tähän tilalle toteuta mahdollisuus valita päivämäärä itse
        // var date_input = temp_day + '.' + temp_month + '.' + temp_year;

        var date_input = DateParser(datePickerDate);

        try {
            const exerciseEntry = {
                exerciseName: data.exerciseName,
                exerciseLength: data.exerciseLength,
                sportType: data.sportType,
                exerciseDate: date_input,
                belongsTo: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            const ref = db.collection('exercises');

            await ref.add(exerciseEntry);

            navigation.goBack();

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={Styles.containerExercisesView}>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={Styles.formInputAddExercise}
                        onBlur={onBlur}
                        placeholder='Lenkin nimi'
                        onChangeText={value => onChange(value)}
                        value={value}
                    />
                )}
                name="exerciseName"
                rules={{ required: true, pattern: exerciseNameRegex }}  // tähän syötetään testattava Regex
                defaultValue=""
            />
            {errors.exerciseName && <Text style={Styles.errorTextAddExerciseScreen}>Anna lenkin nimi</Text>}

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={Styles.formInputAddExercise}
                        onBlur={onBlur}
                        placeholder='Lenkin pituus (km)'
                        onChangeText={value => onChange(value)}
                        value={value}
                    />
                )}
                name="exerciseLength"
                rules={{ required: true, pattern: exerciseLengthRegex }}  // tähän syötetään testattava Regex
                defaultValue=""
            />

            {errors.exerciseLength && <Text style={Styles.errorTextAddExerciseScreen}>Kokonaisluku tai desimaaliluku, jossa korkeintaan kolme desimaalia</Text>}

            {/* https://github.com/react-native-picker/picker */}

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Picker
                        prompt='Laji'
                        placeholder='Laji'
                        mode='dropdown'
                        style={Styles.formInputAddExercise}
                        selectedValue={value}
                        onBlur={onBlur}
                        onValueChange={(itemValue, itemIndex) => {
                            onChange(itemValue)
                        }}
                    >
                        <Picker.Item label="Juoksu" value="running" />
                        <Picker.Item label="Kävely" value="walking" />
                        <Picker.Item label="Pyöräily" value="cycling" />
                    </Picker>
                )}
                name="sportType"
                rules={{ required: true }}
                defaultValue="running"

            />

            <View flexDirection='row'>
                <Text style={Styles.formInputAddExerciseFlex4}>{DateParser(datePickerDate, 'fi')}</Text>
                <TouchableOpacity
                    style={Styles.smallInputButtonFlex1}
                    onPress={showDatePickerMethod}>
                    <Text style={Styles.buttonTextSmall}>Pvm</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (<DateTimePicker
                style={Styles.formInputAddExerciseDate}
                testID="dateTimePicker"
                value={datePickerDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
            /> )}


            <TouchableOpacity
                style={Styles.submitButton}
                onPress={handleSubmit(onSubmit)}>
                <Text style={Styles.buttonText}>Lisää</Text>
            </TouchableOpacity>

        </View>
    );

}


export default AddExerciseScreen;