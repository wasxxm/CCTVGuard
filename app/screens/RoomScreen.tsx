import React, { useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, Button } from "react-native";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import tw from "twrnc";
import { ThemedView } from "@/components/ThemedView";

interface RoomScreenProps {
    setScreen: (screen: string) => void;
    screens: { [key: string]: string };
    setRoomId: (roomId: string) => void;
    roomId: string;
    isCCTV: boolean;
    goBack: () => void;
}

const RoomScreen = ({ setScreen, screens, setRoomId, roomId, isCCTV, goBack } : RoomScreenProps) => {
    useEffect(() => {
        const generateRandomId = () => {
            const characters = "abcdefghijklmnopqrstuvwxyz";
            let result = "";
            for (let i = 0; i < 7; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                result += characters.charAt(randomIndex);
            }
            setRoomId(result);
        };
        if (isCCTV) generateRandomId();
    }, [isCCTV]);

    const checkMeeting = async () => {
        if (roomId) {
            const roomRef = doc(db, "room", roomId);
            const roomSnapshot = await getDoc(roomRef);
            if (!roomSnapshot.exists()) {
                Alert.alert("Wait for the CCTV to start the stream.");
            } else {
                setScreen(screens.JOIN);
            }
        } else {
            Alert.alert("Provide a valid Room ID.");
        }
    };

    return (
        <ThemedView>
            <Button title="Back" onPress={goBack} />
            <Text style={tw`text-2xl font-bold text-center`}>Enter Room ID:</Text>
            <TextInput
                style={tw`bg-white border-sky-600 border-2 mx-5 my-3 p-2 rounded-md`}
                value={roomId}
                onChangeText={setRoomId}
                editable={!isCCTV}
            />
            <View style={tw`gap-y-3 mx-5 mt-2`}>
                {isCCTV ? (
                    <TouchableOpacity
                        style={tw`bg-sky-300 p-2 rounded-md`}
                        onPress={() => setScreen(screens.CALL)}
                    >
                        <Text style={tw`text-center text-xl font-bold`}>Start Streaming</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={tw`bg-sky-300 p-2 rounded-md`}
                        onPress={checkMeeting}
                    >
                        <Text style={tw`text-center text-xl font-bold`}>Join Stream</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
}

export default RoomScreen;
