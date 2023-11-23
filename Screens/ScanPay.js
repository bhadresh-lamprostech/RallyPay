import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import { RlyMumbaiNetwork, getAccount } from "@rly-network/mobile-sdk";

export default function ScanPay() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [amount, setAmount] = useState("");
  const [scannedAddress, setScannedAddress] = useState("");
  const [isProcessingTransaction, setProcessingTransaction] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setScanned(false);
    setProcessingTransaction(false);
  };

  const etherToWei = (amountInEther) => {
    const decimals = 18;
    const amountWei = parseFloat(amountInEther) * Math.pow(10, decimals);
    return Math.floor(amountWei).toString();
  };

  const handlePay = async () => {
    try {
      toggleModal();
      setProcessingTransaction(true);

      const erc20TokenAddress = "0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9";
      const amountWei = etherToWei(amount);

      await RlyMumbaiNetwork.transferExact(
        scannedAddress,
        amountWei,
        erc20TokenAddress
      );

      console.log("done...");
      alert("Transaction sent successfully!");
    } catch (error) {
      console.error("Error sending transaction:", error);

      if (error.reason) {
        alert(`Transaction failed: ${error.reason}`);
      } else if (
        error.code === "CALL_EXCEPTION" &&
        error.body.includes("missing revert data")
      ) {
        alert(
          "Transaction failed: The transaction was intentionally reverted without providing a reason."
        );
      } else {
        alert("Error sending transaction. Please try again.");
      }
    } finally {
      setProcessingTransaction(false);
    }

    console.log("Paid amount:", amount);
    setAmount("");
    setScanned(false);
    setScannedAddress("");
  };

  const handleBarCodeScanned = ({ data }) => {
    if (!isProcessingTransaction) {
      setScanned(true);
      setScannedAddress(data);
      setModalVisible(true);
    }
  };

  const renderTransactionProcessingModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProcessingTransaction}
        onRequestClose={() => setProcessingTransaction(false)}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingMessage}>Processing payment...</Text>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan and Pay</Text>
      <TouchableOpacity style={styles.scanButton} onPress={toggleModal}>
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          {
            scanned && !isProcessingTransaction ? (
              <View style={styles.paymentContainer}>
                <Text style={styles.paymentText}>Enter Amount:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => setAmount(text)}
                />
                <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              </View>
            ) : null /* Render nothing when processing transaction */
          }

          {(!scanned || isProcessingTransaction) && (
            <View style={styles.barcodeScannerContainer}>
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.barcodeScanner}
              />
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  Align QR Code within the frame
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleModal}
              >
                <MaterialIcons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {renderTransactionProcessingModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3498db",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  scanButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  scanButtonText: {
    color: "#3498db",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3498db",
  },
  barcodeScannerContainer: {
    flex: 1,
    width: "80%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    position: "relative",
  },
  barcodeScanner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  paymentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 18,
    marginBottom: 10,
    color: "#fff",
  },
  input: {
    height: 40,
    width: 200,
    borderColor: "#fff",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    color: "#fff",
  },
  payButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  loadingMessage: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});
