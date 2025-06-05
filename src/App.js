import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback

// Initial list of fruits/items with their names, associated ordering medium,
// and step interval for increment/decrement buttons (for gram items).
// MOVED OUTSIDE COMPONENT TO PREVENT RE-CREATION ON EVERY RENDER
const initialFruitsAndMediums = [
  { name: 'Limes', medium: 'case' },
  { name: 'Lemons', medium: 'case' },
  { name: 'Oranges', medium: '' },
  { name: 'Grapefruit', medium: '' },
  { name: 'Cucumber', medium: '' },
  { name: 'Mint', medium: 'small bag of' },
  { name: 'Apples', medium: '' },
  { name: 'Raspberries', medium: '' },
  { name: 'Violas', medium: '' },
  { name: 'Lime Juice', medium: '' },
  { name: 'Lemon Juice', medium: '' },
  { name: 'Eggs', medium: 'tray of' },
  { name: 'Milk', medium: '' },
  { name: 'Oat Milk', medium: 'carton of' },
  // New prep items
  { name: 'Strawberries', medium: 'g', stepInterval: 200 },
  { name: 'Carrots', medium: 'g', stepInterval: 200 },
  { name: 'Pears', medium: 'g', stepInterval: 200 },
  { name: 'Chillies', medium: 'g', stepInterval: 200 },
  { name: 'Blueberries', medium: 'g', stepInterval: 250 },
];

// Specific par levels for each item by day of the week (delivery day).
// Values like '1/2' are represented as 0.5.
// For prep items, their 'par' acts as a flag for when they should appear,
// and also indicates their typical order size for display.
// MOVED OUTSIDE COMPONENT TO PREVENT RE-CREATION ON EVERY RENDER
const parLevelsByDay = {
  'Limes': { 'Monday': 2, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 3, 'Friday': 3, 'Saturday': 3, 'Sunday': 0 },
  'Lemons': { 'Monday': 0.5, 'Tuesday': 0.5, 'Wednesday': 0.5, 'Thursday': 1, 'Friday': 1, 'Saturday': 1, 'Sunday': 0 },
  'Oranges': { 'Monday': 8, 'Tuesday': 12, 'Wednesday': 12, 'Thursday': 12, 'Friday': 16, 'Saturday': 16, 'Sunday': 0 },
  'Grapefruit': { 'Monday': 6, 'Tuesday': 4, 'Wednesday': 4, 'Thursday': 6, 'Friday': 6, 'Saturday': 4, 'Sunday': 0 },
  'Cucumber': { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 2, 'Friday': 2, 'Saturday': 2, 'Sunday': 0 },
  'Mint': { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 2, 'Friday': 2, 'Saturday': 1, 'Sunday': 0 },
  'Apples': { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 2, 'Friday': 1, 'Saturday': 1, 'Sunday': 0 },
  'Raspberries': { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 4, 'Thursday': 2, 'Friday': 2, 'Saturday': 2, 'Sunday': 0 },
  // Violas: Par levels set to 0 for Mon, Tue, Wed delivery (Sun, Mon, Tue ordering)
  'Violas': { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 2, 'Friday': 2, 'Saturday': 0, 'Sunday': 0 },
  'Lime Juice': { 'Monday': 3, 'Tuesday': 3, 'Wednesday': 3, 'Thursday': 4, 'Friday': 6, 'Saturday': 6, 'Sunday': 0 },
  'Lemon Juice': { 'Monday': 2, 'Tuesday': 2, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 3, 'Sunday': 0 },
  'Eggs': { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 2, 'Friday': 2, 'Saturday': 2, 'Sunday': 0 },
  'Milk': { 'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 2, 'Friday': 2, 'Saturday': 2, 'Sunday': 0 },
  // Oat Milk: Par levels for each day. Filtering logic will hide it if par < 1.
  'Oat Milk': { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 1, 'Saturday': 1, 'Sunday': 0 },
  // Par levels for new prep items (delivery days: Tuesday, Wednesday)
  // These pars are now just for display/calculation, not for visibility filtering.
  'Strawberries': { 'Monday': 0, 'Tuesday': 1000, 'Wednesday': 1000, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 },
  'Carrots': { 'Monday': 0, 'Tuesday': 1000, 'Wednesday': 1000, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 },
  'Pears': { 'Monday': 0, 'Tuesday': 1000, 'Wednesday': 1000, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 },
  'Chillies': { 'Monday': 0, 'Tuesday': 800, 'Wednesday': 800, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 },
  'Blueberries': { 'Monday': 0, 'Tuesday': 500, 'Wednesday': 500, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 },
};

// Main App component for the Fruit Order List Generator
function App() {
  // State to hold the list of fruits with their par levels and current counts
  const [fruitData, setFruitData] = useState([]);
  // State variable to store the calculated order list
  const [orderList, setOrderList] = useState([]);
  // State variable for any messages to the user (e.g., errors, success)
  const [message, setMessage] = useState('');
  // State variable to hold the currently selected day of the week (the day you are placing the order)
  const [dayOfWeek, setDayOfWeek] = useState('Monday'); // Default to Monday

  // Days of the week for the dropdown (these are the days you *place* an order)
  // Removed 'Saturday' as no orders are placed on Saturday night.
  const orderingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'];

  /**
   * Helper function to get the delivery day based on the ordering day.
   * Wrapped in useCallback to prevent it from changing on every render.
   * @param {string} orderingDay - The day the order is being placed.
   * @returns {string} The day the order will be delivered.
   */
  const getDeliveryDay = useCallback((orderingDay) => {
    const deliveryDayMap = {
      'Monday': 'Tuesday',
      'Tuesday': 'Wednesday',
      'Wednesday': 'Thursday',
      'Thursday': 'Friday',
      'Friday': 'Saturday',
      'Sunday': 'Monday', // Ordering on Sunday is for Monday delivery
    };
    return deliveryDayMap[orderingDay];
  }, []); // Empty dependency array means this function is created once

  // useEffect to initialize fruit data with the defined par levels for the *delivery* day
  // and reset counts when the component mounts or when the selected day of the week changes.
  useEffect(() => {
    const deliveryDay = getDeliveryDay(dayOfWeek); // Get the delivery day based on the selected ordering day

    const newFruitData = initialFruitsAndMediums.map(fruit => ({
      ...fruit,
      // Get the par level for the *delivery* day, default to 0 if not found
      par: parLevelsByDay[fruit.name]?.[deliveryDay] || 0,
      count: '', // Reset count when day changes to avoid stale data
    }));

    // Filter out Oat Milk and Violas if their par level is less than 1 for the current delivery day.
    // New logic: Filter prep items based on the *ordering day*.
    const filteredFruitData = newFruitData.filter(fruit => {
      // Logic for Violas and Oat Milk (only show if par >= 1 for the delivery day)
      if (fruit.name === 'Oat Milk' || fruit.name === 'Violas') {
        return fruit.par >= 1;
      }
      // Logic for new prep items (only show if ordering on Tuesday or Wednesday)
      if (['Strawberries', 'Carrots', 'Pears', 'Chillies', 'Blueberries'].includes(fruit.name)) {
        return dayOfWeek === 'Tuesday' || dayOfWeek === 'Wednesday';
      }
      return true; // Include all other items by default
    });

    setFruitData(filteredFruitData);
    setOrderList([]); // Clear previous order list when day changes
    setMessage(''); // Clear message
  }, [dayOfWeek, getDeliveryDay]);

  /**
   * Handles changes to the current count input for a specific fruit.
   * @param {number} index - The index of the fruit in the fruitData array.
   * @param {string} value - The new value of the current count input.
   */
  const handleCountChange = (index, value) => {
    const newFruitData = [...fruitData];
    // Allow empty string for "full par" logic, otherwise parse as float for 0.5
    newFruitData[index].count = value;
    setFruitData(newFruitData);
    setMessage(''); // Clear messages when user starts typing
  };

  /**
   * Handles incrementing the current count for a specific fruit.
   * @param {number} index - The index of the fruit in theData array.
   */
  const handleIncrement = (index) => {
    const newFruitData = [...fruitData];
    // Parse current count as float, default to 0 if empty/invalid
    let currentCount = newFruitData[index].count === '' ? 0 : parseFloat(newFruitData[index].count);

    // Determine increment amount based on stepInterval or par level
    let stepAmount = 1; // Default step
    if (newFruitData[index].stepInterval) {
      stepAmount = newFruitData[index].stepInterval;
    } else if (newFruitData[index].par === 0.5 || newFruitData[index].par === 1.5) {
      stepAmount = 0.5;
    }

    newFruitData[index].count = (currentCount + stepAmount).toString(); // Convert back to string for input value
    setFruitData(newFruitData);
    setMessage('');
  };

  /**
   * Handles decrementing the current count for a specific fruit.
   * Ensures the count does not go below zero.
   * @param {number} index - The index of the fruit in the fruitData array.
   */
  const handleDecrement = (index) => {
    const newFruitData = [...fruitData];
    // Parse current count as float, default to 0 if empty/invalid
    let currentCount = newFruitData[index].count === '' ? 0 : parseFloat(newFruitData[index].count);

    // Determine decrement amount based on stepInterval or par level
    let stepAmount = 1; // Default step
    if (newFruitData[index].stepInterval) {
      stepAmount = newFruitData[index].stepInterval;
    } else if (newFruitData[index].par === 0.5 || newFruitData[index].par === 1.5) {
      stepAmount = 0.5;
    }

    // Ensure count doesn't go below 0
    if (currentCount - stepAmount >= 0) {
      newFruitData[index].count = (currentCount - stepAmount).toString(); // Convert back to string for input value
      setFruitData(newFruitData);
      setMessage('');
    } else if (currentCount > 0 && currentCount < stepAmount) {
      // If current count is positive but less than decrement amount, set to 0
      newFruitData[index].count = '0';
      setFruitData(newFruitData);
      setMessage('');
    }
  };

  /**
   * Helper function to format quantity with 'g' or 'kg' unit.
   * @param {number} quantity - The numerical quantity.
   * @param {string} medium - The medium (e.g., 'g', 'case').
   * @returns {string} Formatted quantity with unit.
   */
  const formatQuantityWithUnit = (quantity, medium) => {
    if (medium === 'g') {
      if (quantity >= 1000 && (quantity % 1000 === 0)) { // Check for whole kilograms
        return `${quantity / 1000}kg`;
      } else {
        return `${quantity}g`;
      }
    }
    return Number.isInteger(quantity) ? quantity : quantity.toFixed(1); // For other mediums, just return quantity or fixed decimal
  };

  /**
   * Generates the fruit order list based on current counts and par levels.
   * Iterates through all fruits and calculates the quantity to order.
   * Special handling for Sunday delivery: no order is placed.
   * If count is empty, it assumes 0 for calculation (orders full par).
   */
  const generateOrderList = () => {
    const deliveryDay = getDeliveryDay(dayOfWeek); // This is the day the order is *for*

    // If the order is for Sunday delivery, clear the order list and display a specific message
    if (deliveryDay === 'Sunday') {
      setOrderList([]);
      setMessage('No orders are placed for Sunday delivery (ordered on Saturday night).');
      return;
    }

    const newOrderList = [];
    let hasError = false;

    fruitData.forEach(fruit => {
      let parsedCurrentCount;

      // If the count is an empty string, treat it as 0 (order full par)
      if (fruit.count === '') {
        parsedCurrentCount = 0;
      } else {
        // Parse as a float to handle numbers like 0.5 or gram values
        parsedCurrentCount = parseFloat(fruit.count);

        // Validate if the parsed value is a valid non-negative number
        if (isNaN(parsedCurrentCount) || parsedCurrentCount < 0) {
          setMessage(`Please enter a valid positive number for Current Count for ${fruit.name}.`);
          hasError = true;
          return; // Skip this fruit if validation fails
        }
      }

      let quantityToOrder;
      // For prep items, the quantity to order is simply the current count if it's positive.
      // For other items, it's par - current count.
      if (['Strawberries', 'Carrots', 'Pears', 'Chillies', 'Blueberries'].includes(fruit.name)) {
        quantityToOrder = parsedCurrentCount; // Prep items are 'picked' amounts
      } else if (fruit.name === 'Lemons' && fruit.par === 0.5 && parsedCurrentCount === 0) {
        quantityToOrder = 1; // Special case for lemons: if par is 0.5 and count is 0, order 1 case.
      }
      else {
        quantityToOrder = Math.max(0, fruit.par - parsedCurrentCount);
      }

      // Only add to the list if the quantity to order is positive
      if (quantityToOrder > 0) {
        newOrderList.push({
          id: `${fruit.name}-${Date.now()}`, // Unique ID
          fruit: fruit.name,
          quantity: quantityToOrder,
          medium: fruit.medium // Include the medium in the order item
        });
      }
    });

    if (!hasError) {
      setOrderList(newOrderList);
      if (newOrderList.length === 0) {
        setMessage(`No items needed for order for ${deliveryDay} based on current counts and par levels.`);
      } else {
        setMessage(`Order list generated successfully for ${deliveryDay}!`);
      }
    }
  };

  /**
   * Clears all items from the order list and resets current counts.
   */
  const handleClearList = () => {
    setOrderList([]);
    // Reset all current counts to empty
    const resetFruitData = fruitData.map(fruit => ({ ...fruit, count: '' }));
    setFruitData(resetFruitData);
    setMessage('Order list cleared and counts reset.');
  };

  /**
   * Copies the generated order list to the clipboard.
   * Formats the list into a string before copying, including the medium.
   */
  const handleCopyList = () => {
    if (orderList.length === 0) {
      setMessage('The order list is empty. Nothing to copy.');
      return;
    }

    const listText = orderList
      .map(item => {
        // Format: "Quantity x medium Item Name" or "Quantity x Item Name"
        const itemName = item.fruit.toLowerCase(); // Convert item name to lowercase
        const formattedQuantityAndUnit = formatQuantityWithUnit(item.quantity, item.medium);
        // Only include mediumText if it's not 'g' and it exists
        const mediumText = item.medium !== 'g' && item.medium ? `${item.medium.toLowerCase()} ` : '';
        return `${formattedQuantityAndUnit} x ${mediumText}${itemName}`;
      })
      .join('\n');

    // Using document.execCommand('copy') as navigator.clipboard.writeText() might not work in some iframe environments
    const textarea = document.createElement('textarea');
    textarea.value = listText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setMessage('Order list copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setMessage('Failed to copy list. Please try again or copy manually.');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const deliveryDayForDisplay = getDeliveryDay(dayOfWeek); // Day for which pars are being displayed

  return (
    // Main container with a light background and centered content
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
      {/* Central card-like container for the app */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 max-w-xl border border-gray-200 sm:p-8">
        <h1 className="text-xl font-extrabold text-green-800 mb-5 text-center sm:text-2xl">
          Daily Item Order
        </h1>

        {/* Message Display Area */}
        {message && (
          <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg relative mb-5 text-sm sm:text-base shadow-sm">
            {message}
          </div>
        )}

        {/* Day of the Week Selector Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
          <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2 sm:text-base">
            Ordering on:
          </label>
          <select
            id="dayOfWeek"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-white text-base sm:p-3"
          >
            {orderingDays.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* Item Input Table Section */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-md mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 sm:text-xl">
            Enter Current Counts for {deliveryDayForDisplay} Morning:
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sm:text-sm rounded-tl-lg">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sm:px-2 sm:text-xxs">
                    Current Count
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sm:text-sm rounded-tr-lg">
                    Par Level ({deliveryDayForDisplay})
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fruitData.map((fruit, index) => (
                  <tr key={fruit.name} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sm:text-base">
                      {fruit.name}
                    </td>
                    {/* Current Count Cell */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 sm:text-base">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDecrement(index)}
                          className="p-1 w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 text-base font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          step={fruit.stepInterval || (fruit.par === 0.5 || fruit.par === 1.5 ? 0.5 : 1)}
                          value={fruit.count}
                          onChange={(e) => handleCountChange(index, e.target.value)}
                          className="w-20 p-2 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-150 text-sm sm:w-24 sm:p-2.5 sm:text-base"
                          placeholder="0"
                        />
                        <button
                          onClick={() => handleIncrement(index)}
                          className="p-1 w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 text-base font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    {/* Par Level Cell (now after Current Count) */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 sm:text-base">
                      {/* Display par level, format as 0.5 if it's a fraction */}
                      {formatQuantityWithUnit(fruit.par, fruit.medium)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={generateOrderList}
            className="w-full mt-6 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 shadow-md text-base sm:text-lg"
          >
            Generate Order List
          </button>
        </div>

        {/* Order List Display Section */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4 sm:text-xl">Your Calculated Order:</h2>
          {orderList.length === 0 ? (
            <p className="text-gray-500 italic text-sm sm:text-base">
              {deliveryDayForDisplay === 'Sunday' ? 'No orders are placed for Sunday delivery (ordered on Saturday night).' : `Enter counts and click "Generate Order List" to see your order for ${deliveryDayForDisplay}.`}
            </p>
          ) : (
            <ul className="space-y-2">
              {orderList.map((item) => (
                <li key={item.id} className="text-base text-gray-900 sm:text-lg flex items-center">
                  <span className="font-bold text-green-700 mr-1">
                    {formatQuantityWithUnit(item.quantity, item.medium)}
                  </span>
                  <span className="text-gray-600">x</span>
                  {item.medium !== 'g' && item.medium ? <span className="text-gray-600 ml-1">{item.medium.toLowerCase()}</span> : ''}
                  <span className="ml-1">{item.fruit.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons Section */}
        {orderList.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleCopyList}
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md text-base sm:text-lg"
            >
              Copy List
            </button>
            <button
              onClick={handleClearList}
              className="flex-1 bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition duration-200 shadow-md text-base sm:text-lg"
            >
              Clear List & Reset Counts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
