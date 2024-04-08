import React from 'react';
import Lottie from 'react-lottie';
import CountUp from 'react-countup';

export function renderLottie(state, index, animationData, handleInputChange, handleSubmit, calculateWeeklyTotal, calculateMonthlyTotal) {
  const { counters, previousCounters, inputs } = state;
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
          value={inputs[index]}
          onChange={(event) => handleInputChange(index, event)}
          placeholder="KM"
          step="0.01"
        />
        <button onClick={() => handleSubmit(index)}>Submit</button>
      </div>
      <div className="counter">
        <CountUp
          start={previousCounters[index]}
          end={counters[index]}
          duration={2}
          separator=","
          decimals={2}
          onEnd={() => {
            state.setState(prevState => {
              const newPreviousCounters = [...prevState.previousCounters];
              newPreviousCounters[index] = prevState.counters[index];
              return { previousCounters: newPreviousCounters };
            });
          }}
        />
      </div>
      {/* Weekly and Monthly totals */}
      <div className="weekly-total">{`Weekly Total: ${calculateWeeklyTotal(state.items, index)}`}</div>
      <div className="monthly-total">{`Monthly Total: ${calculateMonthlyTotal(state.items, index)}`}</div>
    </div>
  );
}

export function renderHome(state, animationData1, animationData2, animationData3) {
  return (
    <div className="grid-container">
      {[
        { animationData: animationData1 },
        { animationData: animationData2 },
        { animationData: animationData3 }
      ].map((animation, index) => (
        renderLottie(state, index, animation.animationData, state.handleInputChange, state.handleSubmit, state.calculateWeeklyTotal, state.calculateMonthlyTotal)
      ))}
    </div>
  );
}

export function renderGraphs(state) {
  return (
    <div className="graphs-container">
      <Graphs activities={state.items} /> {/* Render the Graphs component with activities data */}
      <ActivityChart activities={state.items} /> {/* Render the ActivityChart component with activities data */}
    </div>
  );
}

export function renderSidebarMenu(state) {
  const { currentView, sidebarMenuItems, handleMenuItemClick } = state;
  return (
    <div className="sidebar-menu">
      {sidebarMenuItems.map(item => (
        <li
          key={item.key}
          className={`sidebar-menu-item ${item.key === currentView ? 'active' : ''}`}
          onClick={() => handleMenuItemClick(item.key)}
        >
          {item.label}
        </li>
      ))}
    </div>
  );
}
