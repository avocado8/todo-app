import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos"
const WINDOW_SIZE = Dimensions.get("window");

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => {
    setText(payload);
  }
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }
  const addToDo = async () => {
    if(text==="") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: {text, working: working, completed: false}
    };
    setToDos(newToDos)
    await saveToDos(newToDos);
    setText("");
  }
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if(s){
      setToDos(JSON.parse(s));
      setLoading(false);
    }
  };

  const deleteToDo = async (key) => {
    if(Platform.OS === "web"){
      const ok = confirm("Delete To Do?");
      if(ok){
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos)
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        {text: "Cancel"},
        {text: "I'm Sure", onPress: () => {
          const newToDos = {...toDos};
          delete newToDos[key];
          setToDos(newToDos)
          saveToDos(newToDos);
        }},
      ]);
    }
    
    return
  };

  const completeToDo = (key) => {
    const newToDos = {...toDos};
    newToDos[key].completed =!newToDos[key].completed;
    setToDos(newToDos)
    saveToDos(newToDos);
  }

  useEffect( () => {
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white" : theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white" : theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
      onSubmitEditing={addToDo}
      onChangeText={onChangeText}
      returnKeyType='done'
      value={text}
      placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      style={styles.input} />
      {loading
      ? (
        <View style={{width: WINDOW_SIZE, alignItems: "center"}}>
          <ActivityIndicator color="white" size="large" />
        </View>
      )
      : (
        <ScrollView>
          {Object.keys(toDos).map(key => (
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <Text style={{...styles.toDoText, textDecorationLine: toDos[key].completed ? "line-through" : "none",
              color: toDos[key].completed ? theme.toDoBg : "white" }}>{toDos[key].text}</Text>
                <TouchableOpacity style={styles.icon} onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.toDoBg} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon} onPress={() => completeToDo(key)}>
                  <Fontisto name={toDos[key].completed ? "checkbox-active" : "checkbox-passive"} size={18}
                  color={toDos[key].completed ? "white" : theme.toDoBg} />
                </TouchableOpacity>
              </View>
            ) : null
          ))}
      </ScrollView>
      )
      }
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flexGrow: 1,
  },
  icon: {
    marginHorizontal: 10
  }
});
