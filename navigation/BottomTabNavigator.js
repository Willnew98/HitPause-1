import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import Login from '../screens/Login';
import Account from '../screens/AccountScreen';
import QuizScreen from '../screens/QuizScreen';
import LikesScreen from '../screens/LikesScreen';
import JournalEntry from '../screens/JournalEntry';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Home';


export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-home"/>,
        }}
      />
      <BottomTab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: 'Journal',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-book" />,
        }}
      />
      <BottomTab.Screen
        name="JournalEntry"
        component={JournalEntry}
        options={{
          tabBarVisible = false
        }}
      />
      <BottomTab.Screen
        name="PauseQuiz"
        component={QuizScreen}
        options={{
          title: 'HitPause Quiz',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-pause" />,
        }}
      />
      <BottomTab.Screen
        name="History"
        component={LikesScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-bookmark" />,
        }}
      />
      <BottomTab.Screen
        name="Account"
        component={Account}
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-settings" />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Home':
      return 'HitPause';
    case 'Journal':
      return 'My Journal';
    case 'History':
      return 'History';
    case 'Account':
      return 'Account';

  }
}
