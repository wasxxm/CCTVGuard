import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, Button } from "react-native";
import { joinRoom, startStream } from '@/utils/mediasoupClient';
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

const RoomScreen = ({ setScreen, screens, setRoomId, roomId, isCCTV, goBack }: RoomScreenProps) => {
    const [localRoomId, setLocalRoomId] = useState(roomId);

    const handleJoinStream = async () => {
        try {
            await joinRoom(localRoomId);
            setRoomId(localRoomId);
            await startStream(); // Ensure the stream is started after joining the room
            setScreen(screens.JOIN);
        } catch (error) {
            console.error("Error joining room:", error);
            Alert.alert("Error", "Room does not exist. Please check the Room ID.");
        }
    };

    return (
        <ThemedView>
            <Button title="Back" onPress={goBack} />
            <Text style={tw`text-2xl font-bold text-center`}>Enter Room ID:</Text>
            <TextInput
                style={tw`bg-white border-sky-600 border-2 mx-5 my-3 p-2 rounded-md`}
                value={localRoomId}
                onChangeText={setLocalRoomId}
                editable={!isCCTV}
            />
            <View style={tw`gap-y-3 mx-5 mt-2`}>
                {isCCTV ? (
                    <View>
                        <Text style={tw`text-center text-xl`}>Room ID: {roomId}</Text>
                        <TouchableOpacity
                            style={tw`bg-sky-300 p-2 rounded-md`}
                            onPress={() => setScreen(screens.CALL)}
                        >
                            <Text style={tw`text-center text-xl font-bold`}>Start Streaming</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={tw`bg-sky-300 p-2 rounded-md`}
                        onPress={handleJoinStream}
                    >
                        <Text style={tw`text-center text-xl font-bold`}>Join Stream</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
}

export default RoomScreen;
