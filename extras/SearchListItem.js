import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableHighlight
} from "react-native";

const normalPath = '../assets/fav_off.png';
const selected = '../assets/fav_on.png';

export const SearchListItem = ({ item, itemClick ,onFavClick}) => {
  return (
    <View
      style={{ flex: 1, flexDirection: "column", backgroundColor: "white" }}
    >
      <TouchableHighlight onPress={itemClick}>
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.imageView}>
          <View style={styles.favContainer}>
            <Image
              source={require("../assets/mls_logo.png")}
              style={{ height: 30, width: 50 }}
            />
            <View style={{ alignItems: "flex-end", flex: 1 }}>
              <TouchableOpacity onPress={onFavClick}>
                <Image
                  source={require(0 == 0 ? normalPath : selected)}
                  style={{ height: 50, width: 50 }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ backgroundColor: "green", marginLeft: 10 }}>
            <Text style={styles.tagTextView}>New</Text>
          </View>
          <View
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", width: "100%" }}
          >
            <Text style={styles.priceTextView}>${item.listPrice}</Text>
            <Text style={styles.textView}>
              {item.propAddress.streetName},{item.propAddress.city},{" "}
              {item.propAddress.state} {item.propAddress.zip}
            </Text>
            <Text style={styles.subTextView}>MLS# {item.mlsID}</Text>
          </View>
        </ImageBackground>
      </TouchableHighlight>
      <View>
        <Text style={styles.subHeaderText}>
          Listing Courtesy will be shown here. If the text is big ,it will
          appear in two lines
        </Text>
      </View>
    </View>
  );
};
export default SearchListItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  imageView: {
    width: '100%',
    height: 160,
    margin: 0,
    borderRadius: 5,
    alignItems: 'flex-start',
    justifyContent: 'flex-end'
  },
  textView: {
    textAlignVertical: 'center',
    paddingHorizontal: 10,
    paddingBottom: 5,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12
  },

  subTextView: {
    textAlignVertical: 'center',
    paddingLeft: 10,
    paddingBottom: 5,
    color: '#fff',
  },
  priceTextView: {
    textAlignVertical: 'center',
    paddingLeft: 10,
    paddingBottom: 5,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 22
  },

  tagTextView: {
    textAlignVertical: 'center',
    color: '#FFF',
    margin: 3,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold',
    fontSize: 10
  },
  favContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 3,
  },
  subHeaderText: {
    flex: 1,
    color: '#8C8E9B',
    padding: 8,
    alignItems: 'flex-end',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
