
import React, { useState } from "react";
import{
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList
} from "react-native";
import { styles } from "../../styles/ReportsStyles"

const activities = [
  { id: '1', name: 'Camping Trip', time: '2026-05-01' },
  { id: '2', name: 'Hiking', time: '2026-05-15' },
  { id: '3', name: 'First Aid Training', time: '2026-06-01' },
];

const scouts = [
  { id: '1', name: 'Scout A', attended: false, requirementMet: false },
  { id: '2', name: 'Scout B', attended: false, requirementMet: false },
  { id: '3', name: 'Scout C', attended: false, requirementMet: false },
];

export const searchUI = (onSelectActivity: any) => {
      const [query, setQuery] = useState('');

  const filteredActivities = activities.filter(
    (activity) =>
      activity.name.toLowerCase().includes(query.toLowerCase()) ||
      activity.time.includes(query)
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by name or time..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelectActivity(item)}
            style={styles.activityItem}
          >
            <Text>{item.name}</Text>
            <Text>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}