import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { RlyMumbaiNetwork, Network } from "@rly-network/mobile-sdk";

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const addTransaction = () => {
    if (!amount || !address) {
      alert("Please enter both amount and address");
      return;
    }

    const newTransaction = {
      id: transactions.length + 1,
      amount,
      address,
    };

    setTransactions((prevTransactions) => [
      ...prevTransactions,
      newTransaction,
    ]);

    setAmount("");
    setAddress("");
  };

  const deleteTransaction = (id) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id)
    );
  };
  const etherToWei = (amountInEther) => {
    const decimals = 18;
    const amountWei = parseFloat(amountInEther) * Math.pow(10, decimals);
    return Math.floor(amountWei).toString();
  };
  const sendTransactions = async () => {
    try {
      setLoading(true);

      // Loop through transactions and send each one
      for (const transaction of transactions) {
        const { amount, address } = transaction;
        const erc20TokenAddress = "0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9"; // Set your token contract address
        console.log(amount);

        const amountWei = etherToWei(amount);
        console.log(amountWei);

        // Transfer amount ERC20 token expressed in wei to the specified address
        await RlyMumbaiNetwork.transferExact(
          address,
          amountWei,
          erc20TokenAddress
        );
      }

      console.log("done...");

      // Clear the transactions after sending
      setTransactions([]);

      // Optionally show a success message
      alert("Transactions sent successfully!");
    } catch (error) {
      console.error("Error sending transactions:", error);

      if (error.reason) {
        // If the error has a reason, display it
        alert(`Transaction failed: ${error.reason}`);
      } else if (
        error.code === "CALL_EXCEPTION" &&
        error.body.includes("missing revert data")
      ) {
        // If the transaction is intentionally reverted without a reason
        alert(
          "Transaction failed: The transaction was intentionally reverted without providing a reason."
        );
      } else {
        // If the error doesn't have a reason, display a generic message
        alert("Error sending transactions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Transaction Input Form */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => setAmount(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="EOA Address"
          value={address}
          onChangeText={(text) => setAddress(text)}
        />
        <Button title="Add Transaction" onPress={addTransaction} />
      </View>

      {/* Transaction List */}
      <View style={styles.transactionListContainer}>
        <Text style={styles.listTitle}>Transaction List</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <View>
                <Text
                  style={styles.transactionText}
                >{`Amount: ${item.amount}`}</Text>
                <Text
                  style={styles.transactionText}
                >{`EOA Address: ${item.address}`}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Send Transaction Button */}
      <TouchableOpacity
        style={styles.sendTransactionButton}
        onPress={sendTransactions}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.sendTransactionButtonText}>
            Send Transactions
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  transactionListContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 4,
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  transactionItem: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sendTransactionButton: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  sendTransactionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TransactionScreen;