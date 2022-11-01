import React from 'react';
import { Text, View, Button, Linking, AppState, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { useForm, Controller } from "react-hook-form";
import MapView, { PROVIDER_GOOGLE, Polyline, Marker, MarkerAnimated, AnimatedRegion } from 'react-native-maps';
import { FAB } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from '../components/firebase';  // sama tiedosto kuin src/firebase/config.js
import firebase from 'firebase';
import Styles from '../styles/styles';

// import * as Permissions from 'expo-permissions';  // deprecated
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
// import Modal from 'react-native-modal';
import * as IntentLauncher from 'expo-intent-launcher';
import { LocationAccuracy } from 'expo-location';
import haversine from 'haversine';  // matkan laskeminen koordinaateista
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInMilliseconds, differenceInSeconds } from 'date-fns'

// helpers
import GetArrayWithLimitedLength from '../helpers/GetArrayWithLimitedLength';
import CalculateArrayMean from '../helpers/CalculateArrayMean';
import DateParser from '../components/DateParser';



// https://www.youtube.com/watch?v=UcWG2o2gVzw
// https://www.youtube.com/watch?v=0CHCVxB41Ro
// https://medium.com/quick-code/react-native-location-tracking-14ab2c9e2db8
// https://github.com/vikrantnegi/react-native-location-tracking


// Turun keskusta
const LATITUDE = 60.45158803250479;
const LONGITUDE = 22.26687035986571;
const LATITUDE_DELTA = 0.015;  // näytettävän alueen säde
const LONGITUDE_DELTA = 0.015;

const INITIAL_ACCURACY_THRESHOLD = 15;

class RecordExerciseScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            // https://www.youtube.com/watch?v=0CHCVxB41Ro
            location: null,  // mihin kartta keskitetään
            errorMessage: null,
            isLocationModalVisible: false,
            openSetting: false,
            appState: AppState.currentState,
            // elapsedTime: 0,  
            secondsRecorded: 0,  // lenkin aika

            // https://github.com/vikrantnegi/react-native-location-tracking
            latitude: LATITUDE,
            longitude: LONGITUDE,
            routeCoordinates: [],
            distanceTravelled: 0,
            prevLatLng: {},
            coordinate: new AnimatedRegion({
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: 0,
                longitudeDelta: 0,
            }),

            watchingPosition: true,
            isTrackingExercise: false,  // onko lenkin nauhoitus käynnissä (tälle oma nappi käyttöliittymään)
            saveExerciseModalIsVisible: false,
            accuracyThreshold: INITIAL_ACCURACY_THRESHOLD,

            // tallennettavat arvot, kun nauhoitus pysäytetään
            finishedExerciseSecondsRecorded: 0,
            finishedExerciseRouteCoordinates: 0,
            finishedExerciseDistanceTravelled: 0,

            latestAccuracyValues: GetArrayWithLimitedLength(5).fill(INITIAL_ACCURACY_THRESHOLD, 0, 4),

        };

        this.navigation = this.props.navigation;
        this.intervalID = null;
        this.watchID = null;

        this.exerciseNameRegex = /^.+$/;
    }



    // https://aloukissas.medium.com/how-to-build-a-background-timer-in-expo-react-native-without-ejecting-ea7d67478408
    recordStartTime = async () => {
        try {
            const now = new Date();
            await AsyncStorage.setItem("@start_time", now.toISOString());
        } catch (err) {
            console.warn(err);
        }
    };

    getElapsedTime = async () => {
        try {
            const startTime = await AsyncStorage.getItem("@start_time");
            const now = new Date();
            return differenceInSeconds(now, Date.parse(startTime))
        } catch (err) {
            console.warn(err);
        }
    };

    toggleTimer = (timerOn) => {

        if (timerOn) {
            this.setState({ isTrackingExercise: true })
            this.recordStartTime();
            this.intervalID = setInterval(() => {
                this.setState({ secondsRecorded: this.state.secondsRecorded + 1 })
            }, 1000);
            if (this.watchID !== null) {
                this.watchID.remove();
            }
            this.watchUserPosition();
        } else {
            if (this.intervalID !== null) {
                clearInterval(this.intervalID);
            }
            this.setState(
                {
                    finishedExerciseSecondsRecorded: this.state.secondsRecorded,
                    finishedExerciseRouteCoordinates: this.state.routeCoordinates,
                    finishedExerciseDistanceTravelled: this.state.distanceTravelled
                }
            )
            this.setState(
                {
                    secondsRecorded: 0.0,
                    isTrackingExercise: false,
                    routeCoordinates: [],
                    distanceTravelled: 0
                }
            );
            if (this.state.secondsRecorded !== 0 || this.state.routeCoordinates !== []) {
                this.setState({ saveExerciseModalIsVisible: true })
            }
            if (this.watchID !== null) {
                this.watchID.remove();
            }
        }
    };

    initializeLocation = async () => {

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log('location permission not granted')

                this.setState({
                    errorMessage: 'Location permission not granted'

                })
                alert('Location permission not granted');

                return;  // lopetetaan async-metodi, kun lupaa ei annettu
            } else {
                console.log('initializeLocation else block');

                const startingLocation = await Location.getCurrentPositionAsync();
                const { latitude, longitude } = startingLocation.coords;

                console.log('startingLocation value: ', startingLocation);

                const startingCoordinate = {
                    latitude,
                    longitude,
                };

                console.log('startingCoordinate ', startingCoordinate);

                this.setState({
                    location: startingLocation,
                    latitude,
                    longitude,
                    prevLatLng: startingCoordinate,
                    coordinate: startingCoordinate,
                })

                // if (Platform.OS === "android") {
                //     if (this.marker) {
                //         this.marker.animateMarkerToCoordinate(  // poistetaan välistä ._component (this.marker._component.animateMarkerToCoordinate)
                //             startingCoordinate,
                //             500
                //         );
                //     }
                // } else {
                //     coordinate.timing(startingCoordinate).start();
                // }

            }



            if (!this.watchID) {
                if (this.state.isTrackingExercise == true) {
                    this.watchUserPosition();
                }

            }


            // const userLocation = await Location.getCurrentPositionAsync()

            // this.setState({
            //     location: userLocation

            // })

        } catch (error) {
            let providerStatus = await Location.getProviderStatusAsync();
            if (!providerStatus.locationServicesEnabled) {
                this.setState({ isLocationModalVisible: true });
            }
        }


    }

    openSetting = () => {
        if (Platform.OS == 'ios') {
            Linking.openURL('app-settings:')
        } else {
            IntentLauncher.startActivityAsync(
                IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
            )
        }
        this.setState({ openSetting: false })
    }

    handleAppStateChange = (nextAppState) => {
        // siirtymminen etualalle tai aktiiviseen tilaan
        if (this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active') {
            console.log('App changed to the foreground')

            let elapsed = this.getElapsedTime();
            this.setState({ secondsRecorded: elapsed });

            // this.getLocationPermissions();
        }
        this.setState({ appState: nextAppState })
    }

    // https://medium.com/quick-code/react-native-location-tracking-14ab2c9e2db8
    calcDistance = newLatLng => {
        const { prevLatLng } = this.state;
        return haversine(prevLatLng, newLatLng) || 0;
    }

    // https://medium.com/quick-code/react-native-location-tracking-14ab2c9e2db8
    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    })



    // https://github.com/vikrantnegi/react-native-location-tracking/blob/master/App.js
    watchUserPosition = async () => {

        const { coordinate } = this.state;

        // https://docs.expo.io/versions/latest/sdk/location/#locationwatchpositionasyncoptions-callback
        this.watchID = await Location.watchPositionAsync(
            {
                accuracy: LocationAccuracy.BestForNavigation,
                timeInterval: 2000,  // 2 sek
                distanceInterval: 5,  // 5 metriä
            },
            position => {
                // koordinaatin tarkkuusarvolle liukuva raja-arvo viimeisen 5 tarkkuusarvon perusteella
                if (position.coords.accuracy <= CalculateArrayMean(this.state.latestAccuracyValues) * 1.5) {
                    console.log('position accuracy ', position.coords.accuracy, ' accepted');

                    const { routeCoordinates, distanceTravelled } = this.state;
                    const { latitude, longitude } = position.coords;

                    const newCoordinate = {
                        latitude,
                        longitude,
                    };

                    // if (Platform.OS === "android") {
                    //     if (this.marker) {
                    //         this.marker.animateMarkerToCoordinate(  // poistetaan välistä ._component (this.marker._component.animateMarkerToCoordinate)
                    //             newCoordinate,
                    //             500
                    //         );
                    //     }
                    // } else {
                    //     coordinate.timing(newCoordinate).start();
                    // }

                    this.setState({
                        latitude: latitude,
                        longitude: longitude,
                        location: position,
                        routeCoordinates: routeCoordinates.concat([newCoordinate]),
                        distanceTravelled: distanceTravelled + this.calcDistance(newCoordinate),
                        prevLatLng: newCoordinate,
                    });
                }

                this.state.latestAccuracyValues.push(position.coords.accuracy);
                console.log('latestAccuracyValues: ', this.state.latestAccuracyValues)
                console.log('accuracy threshold: ', (CalculateArrayMean(this.state.latestAccuracyValues) * 1.5))

            },
            // error => console.log(error),
            // {
            //     enableHighAccuracy: true,
            //     timeout: 20000,
            //     maximumAge: 1000,
            //     distanceFilter: 10
            // }
        );

    }


    componentDidMount() {
        // console.log('RecordExerciseScreen did mount');

        // this.watchUserPosition();  // reitin tallentaminen

        AppState.addEventListener('change', this.handleAppStateChange)

        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'LocationAsync does not work in emulator'
            });
            alert('LocationAsync does not work in emulator');
        } else {
            this.initializeLocation();
        }

    }


    componentWillUnmount() {
        console.log('RecordExerciseScreen will unmount');

        AppState.removeEventListener('change', this.handleAppStateChange)

        // pysäytetään reitin tallennus
        // https://stackoverflow.com/questions/66450151/unable-to-remove-expo-location-watchpositionasync
        if (this.watchID) {
            this.watchID.remove();
        }

        this.setState({ isTrackingExercise: false })

    }

    // lenkin lisäys tietokantaan
    onSubmit = async (data) => {
        console.log('onSubmit ', data);

        const user = auth.currentUser;

        // var temp_day = new Date().getDate();
        // var temp_month = new Date().getMonth() + 1;
        // var temp_year = new Date().getFullYear();
        // tähän tilalle toteuta mahdollisuus valita päivämäärä itse
        // var date_input = temp_day + '.' + temp_month + '.' + temp_year;

        var date_input = DateParser(new Date());

        try {
            const exerciseEntry = {
                exerciseName: data.exerciseName,
                exerciseLength: parseFloat(this.state.finishedExerciseDistanceTravelled).toFixed(2),
                exerciseDuration: new Date(this.state.finishedExerciseSecondsRecorded * 1000).toISOString().substr(11, 8),
                sportType: data.sportType,
                exerciseDate: date_input,
                belongsTo: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            console.log('onSubmit exerciseEntry: ', exerciseEntry);

            const ref = db.collection('exercises');

            await ref.add(exerciseEntry);

            this.setState({
                finishedExerciseDistanceTravelled: 0,
                finishedExerciseRouteCoordinates: [],
                finishedExerciseSecondsRecorded: 0,
            })

            this.navigation.goBack();

        } catch (error) {
            console.log(error);
        }
    }

    SaveExerciseModal = (props) => {

        const { control, handleSubmit, formState: { errors } } = useForm();

        return (
            <ScrollView style={Styles.containerExercisesView}>
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={this.state.saveExerciseModalIsVisible}
                    onRequestClose={() => {
                        console.log('SaveExercise Modal closed');
                        this.setState({ saveExerciseModalIsVisible: !this.state.saveExerciseModalIsVisible });
                    }}>

                    <View style={localStyle.centeredView}>
                        <View style={localStyle.modalView}>

                            <Text style={[localStyle.modalText, { fontWeight: 'bold' }]}>Tallenna lenkki</Text>

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
                                rules={{ required: true, pattern: this.exerciseNameRegex }}  // tähän syötetään testattava Regex
                                defaultValue=""
                            />

                            {errors.exerciseName && <Text style={Styles.errorTextAddExerciseScreen}>Anna lenkin nimi</Text>}

                            <Text style={localStyle.modalText}>Lenkin kesto: {new Date(this.state.finishedExerciseSecondsRecorded * 1000).toISOString().substr(11, 8)}</Text>

                            <Text style={localStyle.modalText}>Lenkin pituus: {parseFloat(this.state.finishedExerciseDistanceTravelled).toFixed(2)} km</Text>
  
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={[localStyle.modalText, { flex: 1 } ]}>Laji: </Text>
                                        <Picker
                                            prompt='Laji'
                                            placeholder='Laji'
                                            mode='dropdown'
                                            style={[Styles.formInputAddExercise, { flex: 2 }]}
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
                                    </View>
                                )}
                                name="sportType"
                                rules={{ required: true }}
                                defaultValue="running"

                            />

                            <Text style={localStyle.modalText}>Päivämäärä: {DateParser(new Date(), 'fi')}</Text>


                            <TouchableOpacity
                                style={[Styles.submitButton, { width: 200 } ]}
                                onPress={handleSubmit(this.onSubmit)}>
                                <Text style={[Styles.buttonText, { marginLeft: 15, marginRight: 15 }]}>Tallenna lenkki</Text>
                            </TouchableOpacity>

                            <Pressable
                                style={[Styles.logoutButton, { width: 200 } ]}
                                onPress={() => this.setState({ saveExerciseModalIsVisible: !this.state.saveExerciseModalIsVisible })}
                            >
                                <Text style={[Styles.buttonText, { marginLeft: 15, marginRight: 15 }]}>Peruuta</Text>
                            </Pressable>
                        </View>
                    </View>

                </Modal>
            </ScrollView>
        )

    }

    render() {

        // console.log('user location: ', JSON.stringify(this.state.location))

        // const { saveExerciseModalIsVisible } = this.state;

        return (
            <View style={localStyle.container}>
                {/* <Modal
                    onModalHide={this.state.openSetting ? this.openSetting : undefined}
                    isVisible={this.state.isLocationModalVisible}
                >
                    <View style={{
                        height: 300, width: 300, backgroundColor: '#fff',
                        alignItems: 'center', justifyContent: 'center'
                    }} >
                        <Button title='Salli sijaintipalvelun käyttö'
                            onPress={() =>
                                this.setState({
                                    isLocationModalVisible: false,
                                    openSetting: true
                                })}
                        />
                    </View>

                </Modal> */}

                <this.SaveExerciseModal />

                <MapView
                    style={localStyle.map}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    loadingEnabled={true}
                    showsMyLocationButton={true}
                    showsCompass={true}
                    toolbarEnabled={true}
                    zoomEnabled={true}
                    rotateEnabled={true}

                    region={this.getMapRegion()}
                >
                    {this.state.isTrackingExercise ? <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} /> : null}

                    {/* <MarkerAnimated
                        ref={marker => {
                            this.marker = marker;
                        }}
                        coordinate={this.state.coordinate}
                    /> */}

                </MapView>
                <View style={localStyle.buttonContainer}>
                    <TouchableOpacity style={[localStyle.bubble, localStyle.button]} >
                        <Text style={localStyle.bottomBarContent}>{new Date(this.state.secondsRecorded * 1000).toISOString().substr(11, 8)}</Text>
                        <Text style={localStyle.bottomBarContent}>
                            {parseFloat(this.state.distanceTravelled).toFixed(2)} km
                        </Text>
                    </TouchableOpacity>
                </View>
                <FAB
                    style={[localStyle.timerFAB, { backgroundColor: this.state.isTrackingExercise ? 'red' : 'green' }]}
                    icon='alarm'
                    // kun kyseessä React.Component, niin navigaatiota
                    // käytetään tähän tyyliin this.props.navigation
                    // se on tullut propsina sisään isäntäkomponentilta (Stack.Navigator)
                    // automaattisesti
                    onPress={() => {
                        console.log('timerFAB pressed!')
                        this.toggleTimer(!this.state.isTrackingExercise);
                        this.setState({ isTrackingExercise: !this.state.isTrackingExercise });
                    }}
                />

            </View>
        )
    }
}

// https://github.com/vikrantnegi/react-native-location-tracking/blob/master/App.js
const localStyle = StyleSheet.create({
    // https://reactnative.dev/docs/modal
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 15,
        marginRight: 15,
        textAlign: "left"
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    map: {
        ...StyleSheet.absoluteFillObject
    },
    bubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20
    },
    latlng: {
        width: 200,
        alignItems: "stretch"
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: "center",
        marginHorizontal: 10
    },
    buttonContainer: {
        flexDirection: "row",
        marginVertical: 20,
        backgroundColor: "transparent"
    },
    timerFAB: {
        position: 'absolute',
        margin: 24,
        right: 0,
        bottom: 5,
        // backgroundColor: 'green'
    },
});


export default RecordExerciseScreen;