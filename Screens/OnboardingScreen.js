import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Button, Icon, Input } from "react-native-elements";
import Modal from "react-native-modal";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import {
  createAccount,
  importExistingAccount,
  getAccount,
} from "@rly-network/mobile-sdk";
import { useNavigation } from "@react-navigation/native";

const OnboardingScreen = ({ onOnboardingComplete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const existingMnemonic = mnemonic;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const checkAccount = async () => {
      try {
        setLoading(true); // Show loader
        const account = await getAccount();
        if (account) {
          // If account exists, navigate to another screen (e.g., HomeScreen)
          onOnboardingComplete();
        }
      } catch (error) {
        console.error("Error checking account:", error);
      } finally {
        setLoading(false); // Hide loader
      }
    };

    checkAccount();
  }, [navigation]);

  const handleCreateAccount = async () => {
    try {
      setLoading(true); // Show loader
      const newAccount = await createAccount({
        storageOptions: { saveToCloud: false },
      });
      console.log(newAccount);
      onOnboardingComplete();
    } catch (error) {
      console.error("Error creating account:", error);
      // Check for the specific error "Account already exists"
      if (error.message && error.message.includes("Account already exists")) {
        Alert.alert(
          "Account Already Exists",
          "The account you are trying to import already exists. Please use a different mnemonic or create a new account."
        );
      } else {
        // Handle other errors
        Alert.alert("Error", "An error occurred while importing the account.");
      }
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const handleImportAccount = () => {
    toggleModal();
  };

  const handleImportAccountConfirm = async () => {
    try {
      setLoading(true); // Show loader
      const walletAddress = await importExistingAccount(existingMnemonic);
      console.log(walletAddress);
      toggleModal();
      onOnboardingComplete();
    } catch (error) {
      console.error("Error importing account:", error);

      // Check for the specific error "Account already exists"
      if (error.message && error.message.includes("Account already exists")) {
        Alert.alert(
          "Account Already Exists",
          "The account you are trying to import already exists. Please use a different mnemonic or create a new account."
        );
      } else {
        // Handle other errors
        Alert.alert("Error", "An error occurred while importing the account.");
      }
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <View style={styles.container}>
      {!loading && (
        <>
          <Text style={styles.title}>Welcome to RallyPay!</Text>
          <Text style={styles.subtitle}>
            Securely manage your digital assets with our self-custody crypto
            wallet. Enjoy the convenience of batch transactions, easy QR code
            scanning, and seamless payments.
          </Text>
          <Button
            title="Create Wallet"
            onPress={handleCreateAccount}
            containerStyle={styles.buttonContainer}
          />

          <Button
            title="Import Wallet"
            onPress={handleImportAccount}
            icon={<FontAwesomeIcon name="upload" size={20} color="white" />}
            buttonStyle={styles.importButton}
            containerStyle={styles.buttonContainer}
          />
        </>
      )}

      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Import Wallet</Text>
          <Text style={styles.modalSubtitle}>Enter your mnemonic:</Text>
          <Input
            placeholder="Enter your mnemonic"
            value={mnemonic}
            onChangeText={(text) => setMnemonic(text)}
            containerStyle={styles.inputContainer}
          />
          <Button
            title="Confirm"
            onPress={handleImportAccountConfirm}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </Modal>

      {/* Loader */}
      {loading && (
        <>
          <Text style={styles.title}>Welcome to RallyPay!</Text>
          <Text style={styles.subtitle}>
            Securely manage your digital assets with our self-custody crypto
            wallet. Enjoy the convenience of batch transactions, easy QR code
            scanning, and seamless payments.
          </Text>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loaderText}>Processing...</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#4CAF50", // Green color for emphasis
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
    color: "#777", // Dark gray color for a subtle look
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 16,
  },
  importButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  loaderContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loaderText: {
    marginTop: 10,
    color: "#4CAF50",
  },
});

export default OnboardingScreen;
