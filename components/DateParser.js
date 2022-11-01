import React, { useState } from "react";
import { Text, View, TextInput, Button, Alert, MaskedViewComponent, TouchableOpacity } from "react-native";


// itse tehty apukomponentti päivämäärien muotoiluun
const DateParser = (dateInput, locale) => {

    var dateStringOutput = '';

    switch (locale) {
        case "fi":
            dateStringOutput = dateInput.getDate() + '.' + (dateInput.getMonth() + 1) + '.' + dateInput.getFullYear();
            break;
        default:
            dateStringOutput = dateInput.getDate() + '.' + (dateInput.getMonth() + 1) + '.' + dateInput.getFullYear();
            break;
    }

    return dateStringOutput;

}

export default DateParser;