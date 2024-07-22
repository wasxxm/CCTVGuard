import React, { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import tw from "twrnc";

interface RoomScreenProps {
    setScreen: (screen: string) => void;
    screens: any;
    setRoomId: (roomId: string) => void;
    roomId: string;
}

export default function RoomScreen({ setScreen, screens, setRoomId, roomId }: RoomScreenProps) {
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
        generateRandomId();
    }, []);

    const checkMeeting = async () => {
        if (roomId) {
            const roomRef = doc(db, "room", roomId);
            const roomSnapshot = await getDoc(roomRef);
            if (!roomSnapshot.exists()) {
                Alert.alert("Wait for your instructor to start the meeting.");
            } else {
                setScreen(screens.JOIN);
            }
        } else {
            Alert.alert("Provide a valid Room ID.");
        }
    };

    return (
        <View>
            <Text style={tw`text-2xl font-bold text-center`}>Enter Room ID:</Text>
            <TextInput
                style={tw`bg-white border-sky-600 border-2 mx-5 my-3 p-2 rounded-md`}
                value={roomId}
                onChangeText={setRoomId}
            />
            <View style={tw`gap-y-3 mx-5 mt-2`}>
                <TouchableOpacity
                    style={tw`bg-sky-300 p-2  rounded-md`}
                    onPress={() => setScreen(screens.CALL)}
                >
                    <Text style={tw`text-center text-xl font-bold `}>Start meeting</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={tw`bg-sky-300 p-2 rounded-md`}
                    onPress={checkMeeting}
                >
                    <Text style={tw`text-center text-xl font-bold `}>Join meeting</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
