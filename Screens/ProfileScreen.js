import React, { useState, useEffect, useCallback } from "react";
import * as Linking from "expo-linking";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  getAccount,
  getAccountPhrase,
  RlyMumbaiNetwork,
} from "@rly-network/mobile-sdk";

const ProfileScreen = () => {
  const [walletAddress, setWalletAddress] = useState("Your Wallet Address");
  const [mnemonic, setMnemonic] = useState(null);
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);
  const [balance, setBalance] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(false); // New state for claim loader

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    const fetchAccount = async () => {
      try {
        const account = await getAccount();
        setWalletAddress(account);

        const erc20TokenAddress = "0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9";
        const balance = await RlyMumbaiNetwork.getDisplayBalance(
          erc20TokenAddress
        );
        setBalance(balance);
      } catch (error) {
        console.error("Error fetching account:", error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchAccount();
  }, []);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const rlyNetwork = RlyMumbaiNetwork;
  const apiKey =
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOjIyN30.XBqmRknN4PYFSQ454WUciRrzeNbesJMYHibGm7fUSI6WJGM6hkMrZMT0MoJX3x5yOhWi3Iqxxp3SHbQc2Kx9lA";
  rlyNetwork.setApiKey(apiKey);

  const claimRlyTokens = async () => {
    try {
      setLoadingClaim(true); // Set loading state to true
      await RlyMumbaiNetwork.claimRly();
      alert("Claimed 10 test RLY tokens successfully!");
    } catch (error) {
      if (
        typeof error === "string" &&
        error.includes("Account already dusted, will not dust again")
      ) {
        alert("You can claim Rally tokens only once.");
      } else {
        alert("Error claiming RLY tokens. Please try again.");
        console.error("Error claiming RLY tokens:", error);
      }
    } finally {
      setLoadingClaim(false); // Set loading state to false
    }
  };

  const handleForgetMnemonic = async () => {
    try {
      setLoadingMnemonic(true);
      const accountMnemonic = await getAccountPhrase();
      setMnemonic(accountMnemonic);
    } catch (error) {
      console.error("Error fetching mnemonic:", error);
    } finally {
      setLoadingMnemonic(false);
    }
  };

  const handleCopyMnemonic = async () => {
    if (mnemonic) {
      try {
        await Clipboard.setStringAsync(mnemonic.trim());
        ToastAndroid.show("Mnemonic copied to clipboard", ToastAndroid.SHORT);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    } else {
      console.warn(
        "Mnemonic is either null or not a valid string. Unable to copy to clipboard."
      );
    }
  };

  const handleCopyWalletAddress = async () => {
    try {
      await Clipboard.setStringAsync(walletAddress.trim());
      ToastAndroid.show(
        "Wallet address copied to clipboard",
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error("Error copying wallet address to clipboard:", error);
    }
  };

  const truncatedAddress =
    walletAddress.substring(0, 10) +
    "..." +
    walletAddress.substring(walletAddress.length - 10);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Wallet Information</Text>

            <View style={styles.walletAddressContainer}>
              <Text style={styles.label}>Your Wallet Address</Text>
              <View style={styles.walletAddressRow}>
                <Text style={styles.walletAddress}>{truncatedAddress}</Text>
                <TouchableOpacity onPress={handleCopyWalletAddress}>
                  <FontAwesome5 name="copy" size={16} color="#3498db" />
                </TouchableOpacity>
              </View>
            </View>

            <QRCode
              style={styles.qrCodeContainer}
              value={walletAddress}
              size={200}
            />

            {balance !== null && (
              <View style={styles.balanceContainer}>
                <Text style={styles.label}>Balance:</Text>
                <Text style={styles.balance}>{balance} RLY</Text>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.forgetButton]}
                onPress={handleForgetMnemonic}
              >
                {loadingMnemonic ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Export Mnemonic</Text>
                )}
              </TouchableOpacity>

              {mnemonic && (
                <TouchableOpacity
                  style={[styles.button, styles.copyButton]}
                  onPress={handleCopyMnemonic}
                >
                  <Text style={styles.buttonText}>Copy Mnemonic</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          Linking.openURL(
            `https://mumbai.polygonscan.com/address/${walletAddress}#tokentxns`
          )
        }
      >
        <Text style={styles.transactionsLinkText}>
          View your all transactions on Polygon MumbaiScan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editButton}
        onPress={claimRlyTokens}
        disabled={loadingClaim} // Disable the button when loadingClaim is true
      >
        {loadingClaim ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.editButtonText}>Claim Rally Tokens</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  cardContainer: {
    margin: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555555",
  },
  walletAddressContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  walletAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletAddress: {
    fontSize: 16,
    marginBottom: 10,
    color: "#3498db",
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    width: "100%",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  forgetButton: {
    backgroundColor: "#e74c3c",
  },
  copyButton: {
    backgroundColor: "#3498db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
    opacity: (loadingClaim) => (loadingClaim ? 0.5 : 1), // Adjust opacity when loadingClaim is true
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  balanceContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  balance: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3498db",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default ProfileScreen;
