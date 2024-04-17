import React, { Component } from 'react';
import { googleLogout} from '@react-oauth/google';
import './App.css';
import Lottie from 'react-lottie';
import CountUp from 'react-countup';
import { SlArrowRightCircle } from "react-icons/sl"; 
import animationData1 from "./assets/Animation1.json";
import animationData2 from "./assets/Animation2.json";
import animationData3 from "./assets/Animation3.json";
import animationData4 from "./assets/Animation4.json";
import Sidebar from "react-sidebar";
import axios from 'axios';
import Graphs from './graphs';
import ActivityChart from './ActivityChart';
import Login from './Login';
const baseUrl = '/activities'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputs: ["", "", ""],
      counters: [0, 0, 0],
      previousCounters: [0, 0, 0],
      sidebarOpen: true,
      items: [],
      currentView: 'Home',
      animationIndex: null, //  state variable to track the index of the submit button triggering the animation
      isLoggedIn: false // State variable to track login status
    };
    this.sidebarMenuItems = [
      { label: 'Home', key: 'Home' },
      { label: 'Graphs', key: 'Graphs' },
      { label: 'Settings', key: 'Settings' }
    ];
  }

  componentDidMount() {
    // Check if the user is already logged in (You can implement your logic here)
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.setState({ isLoggedIn: true }); 
      this.fetchItems(); // Call fetchItems after setting isLoggedIn to true
    }
  }

  handleLoginSuccess = () => {
    // Update state to reflect that the user is logged in
    this.setState({ isLoggedIn: true });
    // Save login status to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Fetch items after successful login
    this.fetchItems();
  };
  // Add a method to handle logout
  handleLogout = () => {
    // Update state to reflect that the user is logged out
    this.setState({ isLoggedIn: false });
    // Remove login status from localStorage
    localStorage.removeItem('isLoggedIn');
    googleLogout();
  };

  fetchItems() {
    axios.get(baseUrl)
      .then(response => {
        this.setState({ items: response.data }, () => {
          this.updateCounters();
        });
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }

  updateCounters() {
    const { items } = this.state;
    const counters = [0, 0, 0];
    items.forEach(item => {
      switch (item.type) {
        case "Swimming":
          counters[0] += item.distance;
          break;
        case "Running":
          counters[1] += item.distance;
          break;
        case "Cycling":
          counters[2] += item.distance;
          break;
        default:
          break;
      }
    });
    this.setState({ counters });
  }

  handleInputChange(index, event) {
    const { value } = event.target;
    this.setState(prevState => {
      const inputs = [...prevState.inputs];
      inputs[index] = value;
      return { inputs };
    });
  }

  handleSubmit(index) {
    const { inputs } = this.state;
    const inputValue = parseFloat(inputs[index]);
    if (!isNaN(inputValue) && inputValue >= 0) {
      const data = {
        type: this.getActivityType(index),
        distance: inputValue
      };
  
      axios.post(baseUrl, data)
        .then(response => {
          console.log('Activity created successfully:', response.data);
          this.fetchItems();
          const newInputs = [...inputs];
          newInputs[index] = "";
          this.setState({ inputs: newInputs, animationIndex: index }); // Set the animation index
  
          setTimeout(() => {
            this.setState({ animationIndex: null }); // Reset the animation index after the desired duration
          }, 6000); 
        })
        .catch(error => {
          console.error('Error creating activity:', error);
        });
    }
  }


  getActivityType(index) {
    switch (index) {
      case 0:
        return "Swimming";
      case 1:
        return "Running";
      case 2:
        return "Cycling";
      default:
        return "";
    }
  }

  handleMenuItemClick = (view) => {
    this.setState({ currentView: view });
  };

  calculateWeeklyTotal(index) {
    const { items } = this.state;
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeklyActivities = items.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= currentDate && activity.type === this.getActivityType(index);
    });

    return weeklyActivities.reduce((total, activity) => total + activity.distance, 0);
  }

  calculateMonthlyTotal(index) {
    const { items } = this.state;
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(1);

    const monthlyActivities = items.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= currentDate && activity.type === this.getActivityType(index);
    });

    return monthlyActivities.reduce((total, activity) => total + activity.distance, 0);
  }

  renderLottie(index, animationData) {
    const { counters, previousCounters, animationIndex } = this.state;
    let title = "";
    switch (index) {
      case 0:
        title = "Swimming";
        break;
      case 1:
        title = "Running";
        break;
      case 2:
        title = "Cycling";
        break;
      default:
        title = "";
    }
    
    return (
      <div className="column" key={index}>
        <div className="animation-title">{title}</div>
        <div className="animation-container">
          <Lottie
            options={{
              animationData,
              autoplay: true,
              loop: true,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
              }
            }}
            height={250}
            width={250}
          />
        </div>
        <div className="input-button-container">
          <input
            type="number"
            value={this.state.inputs[index]}
            onChange={(event) => this.handleInputChange(index, event)}
            placeholder="KM"
            step="0.01"
          />
          <div className="icon-container">
            <SlArrowRightCircle
              className="submit-icon"
              onClick={() => this.handleSubmit(index)}
            />
          </div>
        </div>
        <div className="counter">
          <CountUp
            start={previousCounters[index]}
            end={counters[index]}
            duration={2}
            separator=","
            decimals={2}
            onEnd={() => {
              this.setState(prevState => {
                const newPreviousCounters = [...prevState.previousCounters];
                newPreviousCounters[index] = prevState.counters[index];
                return { previousCounters: newPreviousCounters };
              });
            }}
          />
        </div>
        <div className="weekly-total">Weekly Total: {this.calculateWeeklyTotal(index)}</div>
        <div className="monthly-total" style={{ marginBottom: '10px' }}>Monthly Total: {this.calculateMonthlyTotal(index)}</div>
        {animationIndex === index && ( // Display animation container only for the specific index
          <div className="animation-container-small" style={{ margin: 'auto' }}>
            <Lottie
              options={{
                animationData: animationData4,
                autoplay: true,
                loop: false,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice'
                },
                renderer: 'svg', 
              }}
              height={100}
              width={100}
              
            />
          </div>
        )}
      </div>
    );
  }

  renderHome() {
    return (
      <div className="grid-container">
        {[
          { animationData: animationData1 },
          { animationData: animationData2 },
          { animationData: animationData3 }
        ].map((animation, index) => (
          this.renderLottie(index, animation.animationData)
        ))}
      </div>
    );
  }

  renderGraphs() {
    return (
      <div className="graphs-container">
        <h1>10-Days</h1>
        <Graphs activities={this.state.items} />
        <ActivityChart activities={this.state.items} />
      </div>
    );
  }

  renderSidebarMenu() {
    const { currentView } = this.state;
    return (
      <div className="sidebar-menu">
        {this.sidebarMenuItems.map(item => (
          <li
            key={item.key}
            className={`sidebar-menu-item ${item.key === currentView ? 'active' : ''}`}
            onClick={() => this.handleMenuItemClick(item.key)}
          >
            {item.label}
          </li>
        ))}
      </div>
    );
  }
  

  render() {
    const { currentView, isLoggedIn } = this.state;

    if (!isLoggedIn) {
      return (
        <div>
          <Login onLoginSuccess={this.handleLoginSuccess} />
        </div>
      );
    }
    

    return (
      <div className="App">
        <Sidebar
          sidebar={
            <div className="sidebar">
              <h2 className="sidebar-title">TRIAthlon</h2>
              {this.renderSidebarMenu()}
              <button onClick={this.handleLogout}>Logout</button>
            </div>
          }
          open={this.state.sidebarOpen}
          onSetOpen={this.toggleSidebar}
          docked={true}
          sidebarClassName="sidebar"
          contentClassName="content"
        >
          {currentView === 'Home' && this.renderHome()}
          {currentView === 'Graphs' && this.renderGraphs()}
        </Sidebar>
      </div>
    );
  }
}

export default App;
