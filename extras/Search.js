

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  Text,
  Image,
  Alert,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  SectionList,
  Dimensions,
  ImageBackground,
  Platform
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps'
import ClusteredMapView from './ClusteredMapView';

import SearchListItem from './SearchListItem'

let {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width/height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.4922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const viewTypes = {
  map: 'map',
  list: 'list',
  swipe: 'swipe'
}


const ContainerView = (props) => {
  const {parent, dataSource, polygonCoordinates, isLoading, mapDatasource, listDatasource, searchText, selectedViewType, listPropsResultCount1} = props
  const mapPropsArr = mapDatasource.property ? mapDatasource.property : []
  var clusterFormatedLocations = [{ id: `pin${Math.random()}`, location: {
    latitude: 47.0142,
    longitude: -47.9821
  } }]
  var initialLat = 47.0142,
        initialLong = -47.9821

  var seggregatedArr = []
  if (parent.state.isPropertyDetails == true) {
    clusterFormatedLocations = []
    mapPropsArr.forEach(eachProp => {
      var foundProperty = false
      let currentPropLatitude = eachProp.latitude
      initialLat = parseFloat(eachProp.latitude)
      initialLong = parseFloat(eachProp.longitude)
      for (let i=0; i<seggregatedArr.length; i++){
        let segPropArr = seggregatedArr[i]
        if (segPropArr instanceof Array) {
          var subArr = segPropArr
          if (subArr.length > 0) {
            let segProp = subArr[0]
            if (segProp.latitude == currentPropLatitude) {
              foundProperty = true
              subArr.push(eachProp)
              break
            }
          }
       }
      }
  
      if (foundProperty == false) {
        let newProprtyArr = []
        newProprtyArr.push(eachProp)
        seggregatedArr.push(newProprtyArr)
      }
    })
  }
  else if (mapPropsArr.length > 0) {
    mapPropsArr.forEach(eachProp => {
      clusterFormatedLocations.push({ id: `pin${Math.random()}`, location: {
        latitude: parseFloat(eachProp.latitude),
        longitude: parseFloat(eachProp.longitude)
      } })
    })
  }
  
  var polygonCoordinatesArr = []
  var allCooradinates = []
  polygonCoordinates.forEach(eachElement => {
    var coordinatesArr = [];
    eachElement.forEach(innerElement => {
      let coords = {
        latitude: parseFloat(innerElement.latitude),
        longitude: parseFloat(innerElement.longitude),
         LATITUDE_DELTA,
         LONGITUDE_DELTA
      }
      coordinatesArr.push(coords);
      allCooradinates.push(coords);
    })
    
    polygonCoordinatesArr.push(coordinatesArr);
      })
      if (allCooradinates.length == 0) {
        allCooradinates.push({
          latitude: 47.00321,
          longitude: -46.4387,
           LATITUDE_DELTA,
           LONGITUDE_DELTA
        })
      }  
  if (mapPropsArr.length > 0) {
    parent.state.region = {
      latitude: parseFloat(mapPropsArr[0].latitude),
      longitude: parseFloat(mapPropsArr[0].longitude)
    }
  }
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(52, 52, 52, alpha)'}}>
        <ActivityIndicator size='large'
          color='#1F47AF'
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={{ backgroundColor: '#1F47AF' }}>
          <TextInput style={styles.input}
            underlineColorAndroid="transparent"
            placeholder="Search by city, state, ZIP, school"
            placeholderTextColor="#8C8E9B"
            autoCapitalize="none"
            onChangeText={(text) =>
              parent._fecthSuggestions(text)
            }
          />
        </View>
      <View style={styles.header}>
      {
          selectedViewType == viewTypes.map ?
          <View style={styles.highlightedBackground}>
          <TouchableOpacity onPress={() => parent.handleMapClicked(parent)}>
              <Text style={styles.highlightedHeaderText}>MAP</Text>
            </TouchableOpacity>
          </View>
            :
          <TouchableOpacity onPress={() => parent.handleMapClicked(parent)}>
              <Text style={styles.headerText}>MAP</Text>
            </TouchableOpacity> 
      }
      {
        selectedViewType == viewTypes.list ?
        <View style={styles.highlightedBackground}>
        <TouchableOpacity onPress={() => parent.handleListClicked(parent)}>
          <Text style={styles.highlightedHeaderText}>LIST</Text>
          </TouchableOpacity>
        </View>
        :
        <TouchableOpacity onPress={() => parent.handleListClicked(parent)}>
          <Text style={styles.headerText}>LIST</Text>
          </TouchableOpacity>
      }
      {
        selectedViewType == viewTypes.swipe ?
        <View style={styles.highlightedBackground}>
        <TouchableOpacity onPress={() => parent.handleSwipeClicked(parent)}>
        <Text style={styles.highlightedHeaderText}>SWIPE</Text>
        </TouchableOpacity>
        </View>
        :
        <TouchableOpacity onPress={() => parent.handleSwipeClicked(parent)}>
        <Text style={styles.headerText}>SWIPE</Text>
        </TouchableOpacity>
      } 
        
        <View style={styles.headerFilterTextContainer}>
              <TouchableOpacity onPress={() => parent.handleFilterTap()}>
                <Text style={styles.headerText}>FILTERS</Text>
              </TouchableOpacity>
          </View>
      </View>

      <View style = {styles.mapListContainer} >
    {
          dataSource.length != 0 ?
            <SectionList
              sections={dataSource}
              renderItem={({ item }) => {
                let searchTextWOTrailingSpace = searchText.trim(' ')
                let indexVal = item.level1Text.toLowerCase().indexOf(searchTextWOTrailingSpace.toLowerCase());
                let suggestionTextFirstpart = item.level1Text.substring(0, searchTextWOTrailingSpace.length) ? item.level1Text.substring(0, searchTextWOTrailingSpace.length) : ""
                var suggestionTextSecondpart = "";
                if (indexVal > -1) {
                  suggestionTextSecondpart = item.level1Text.substring(indexVal + searchTextWOTrailingSpace.length);
                }
                return (<View style={{ flex: 1, flexDirection: 'column', marginHorizontal: 20, marginVertical: 10, backgroundColor: 'white' }}>
                  <TouchableOpacity onPress={parent.suggestionClicked.bind(parent, item)}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.level1BlueTextStyle}>{suggestionTextFirstpart}</Text>
                      <Text style={styles.level1GreyTextStyle}>{suggestionTextSecondpart}</Text>
                    </View>
                    <Text style={styles.level2TextStyle}>{item.level2Text}</Text>
                  </TouchableOpacity>
                </View>)
              }
              }
              renderSectionHeader={({ section }) => {
                var type = section.index
                var imagePath = require('../assets/place.png');
                switch(type){
                  case 0:
                  imagePath = require('../assets/place.png');
                  break;
                  case 1:
                  imagePath = require('../assets/schools.png')
                  break;
                  case 2:
                  imagePath = require('../assets/address.png')
                  break;
                  case 3:
                  imagePath = require('../assets/address.png')
                  break;
                }
                return (
                  <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 8, backgroundColor: '#E4E4E4'}}>
                    <Image source={imagePath} />
                    <Text style={styles.sectionHeaderStyle}>{section.title}</Text>
                  </View>
                )
              }
              }
              keyExtractor={(item, index) => index.toString()}
              style={styles.flatListStyle}
            />
            :
            // <MapView
            // provider = {PROVIDER_GOOGLE}
            // key = {false}
            // ref={(ref) => { parent.mapRef = ref }}
            // style = {styles.mapContainer}
            // opacity = {selectedViewType == viewTypes.map ? 1.0 : 0.0}
            // showsUserLocation = {true}
            // onLayout = {() => parent.mapRef.fitToCoordinates(allCooradinates, { edgePadding: { top: 10, right: 10, bottom: 10, left: 10 }, animated: false })}
            // // region = {parent.state.region}
            // ></MapView>
            
            // >

          <ClusteredMapView
          // provider = {PROVIDER_GOOGLE}
          // key = {false}
          ref={(ref) => { parent.mapRef = ref }}
          style={ styles.mapContainer }
          data={clusterFormatedLocations}
          clusteringEnabled = {parent.state.isPropertyDetails ? !parent.state.isPropertyDetails : true}
          initialRegion={parent.state.isPropertyDetails == true ? {latitude: initialLat, longitude: initialLong, latitudeDelta: 0.0, longitudeDelta: 0.0 } : {latitude: 40.730610, longitude: -73.935242, latitudeDelta: 0.0, longitudeDelta: 0.0 }}
          opacity = {selectedViewType == viewTypes.map ? 1.0 : 0.0}
          renderMarker={parent.renderMarker}
          renderCluster={parent.renderCluster}
          regionChanged={parent.onRegionChangeComplete}
          showsUserLocation = {true}
          onClusterPressed={parent.onClusterClick}
          // onRegionChangeComplete={this.onRegionChangeComplete}
          onLayout = {() => parent.mapRef.mapview.fitToCoordinates(allCooradinates, { edgePadding: { top: 10, right: 10, bottom: 250, left: 10 }, animated: false })}
          onMoveShouldSetResponder={() => {
            parent.onPanDragStart()
            return true
          }}

          // onResponderRelease={parent.onPanDragStop}
          >
          
          {
            parent.state.isPropertyDetails == true ?
            seggregatedArr.map((eachPropArr, index) => (
              <MapView.Marker key={index} coordinate={{latitude: parseFloat(eachPropArr[0].latitude), longitude: parseFloat(eachPropArr[0].longitude)}}
              // onPress={this.onPressMarker}
              onMarkerPress={ this.onPressMarker}>
              <ImageBackground source={require('../assets/pricepin.png')} style={{width: 45.0, height: 22.0}}>
                <Text style = {{color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2.5, textAlign: 'center'}}>{parent.calculatedPriceString(eachPropArr)}</Text>
                </ImageBackground>
            </MapView.Marker>
            ))
            // <Marker coordinate={{ latitude: 44.710968, longitude: 10.640131 }} pinColor={'#65bc46'} />
            :
            <View></View>
          }
          {
          polygonCoordinatesArr.map(polygon =>
          (<MapView.Polygon
            coordinates={polygon}
            fillColor='rgba(0,0,0,0)'
            strokeColor='#8B8D99'
          />),
        )}
          </ClusteredMapView>          
          //   {
          //     isPropertyDetails == true ?
            //   seggregatedArr.map((eachPropArr, index) => (
            //   <MapView.Marker key={index} coordinate={{latitude: parseFloat(eachPropArr[0].latitude), longitude: parseFloat(eachPropArr[0].longitude)}}>
            //   <ImageBackground source={require('../../assets/pricepin.png')} style={{width: 45.0, height: 22.0}}>
            //     <Text style = {{color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2.5, textAlign: 'center'}}>{parent.calculatedPriceString(eachPropArr)}</Text>
            //     </ImageBackground>
            // </MapView.Marker>
            // ))
          //   :
          //   mapPropsArr.map((eachProp, index) => (
          //     <MapView.Marker key={index} coordinate={{latitude: parseFloat(eachProp.latitude), longitude: parseFloat(eachProp.longitude)}}>
          //     <ImageBackground source={require('../../assets/pin.png')} style={{width: 15.0, height: 15.0}}>
          //       {/* <Text style = {{color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2.5, textAlign: 'center'}}>{parent.calculatedPriceString(eachPropArr)}</Text> */}
          //       </ImageBackground>
          //   </MapView.Marker>
          //   ))
          // }
        // {
        //   polygonCoordinatesArr.map(polygon =>
        //   (<MapView.Polygon
        //     coordinates={polygon}
        //     fillColor='rgba(0,0,0,0)'
        //     strokeColor='black'
        //   />),
        // )}
        // </MapView>   
        }
        {
          listDatasource.length != 0 ?
            <FlatList
              onEndReachedThreshold={0.5}
              onEndReached={({ distanceFromEnd }) => {
                //Call API to fetch next page of data
                // console.log('on end reached ', distanceFromEnd);
                if (listDatasource.length < 100 && parent.state.listPropsResultCount > listDatasource.length) {
                  let searchURL = parent.state.currentSearchURL + '/' + (parent.state.currentListPageIndex + 1) 
                  parent.fetchListCall(searchURL);
                  parent.setState({currentListPageIndex: parent.state.currentListPageIndex+1});
                } 
              }}
              ListFooterComponent={(
                listDatasource.length < 100 && parent.state.listPropsResultCount > listDatasource.length ?
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator size='small' color='#6d4c41'/>
                  {/* <Text>Loading please wait...</Text> */}
                </View>
                :
                <View></View>
              )}
              data={listDatasource}
              renderItem={({ item, index }) =>
                <SearchListItem
                  item={item}
                  itemClick={() => parent.handleListTap(item)}
                  onFavClick={() => parent.handleFavTap(item)} />
              }
              keyExtractor={(item, index) => index.toString()}
              style={selectedViewType == viewTypes.list ? styles.listFlatListAbsoluteStyle : styles.listFlatListRelativeStyle}
               opacity = {selectedViewType == viewTypes.list ? 1.0 : 0.0}
            />
            :
            <View />
            }
            </View>
    </SafeAreaView>
  );

  
}

class Search extends Component {
  constructor(props) {

    super(props);
    this.mapRef = null;
    this.watchID = null;
    this.state = {
      isLoading: false,
      currentSearchURL: "",
      currentListPageIndex: 1,
      listDatasource: [],
      nextPageListDatasource: [],
      mapDatasource: [],
      dataSource: [],
      polygonCoordinates: [],
      searchText: String,
      selectedViewType: 'map',
      listPropsResultCount: 0,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      isMapDraggedManually: false,
      isPropertyDetails: false,
    };

    this.renderMarker = this.renderMarker.bind(this)
    this.renderCluster = this.renderCluster.bind(this)
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)

  }

  renderCluster = (cluster, onPress) => {
    var pointCount = cluster.pointCount;
    const coordinate = cluster.coordinate,
    clusterId = cluster.clusterId

    if (cluster.pointCount <= 0) {
      pointCount = 1;
    }

    return (
    <Marker identifier={`cluster-${clusterId}`} coordinate={coordinate} onPress={onPress}>
      <View style={styles.clusterContainer}>
        <Text style={Platform.OS == 'ios' ? styles.clusterTextiOS : styles.clusterTextAndroid}>
          {pointCount}
        </Text>
      </View>
    </Marker>
    )
  }

  renderMarker = (data) => <Marker identifier={`cluster-${data.id}`} coordinate={data.location} >
  {/* <View style={styles.clusterContainer}>
    <Text style={Platform.OS == 'ios' ? styles.clusterTextiOS : styles.clusterTextAndroid}>
      {1}
    </Text>
  </View> */}
</Marker>

  handleMapClicked = parent => {
    parent.setState({selectedViewType: 'map'});
  }

  handleListClicked = parent => {
    parent.setState({selectedViewType: 'list'});
  }

  handleSwipeClicked = parent => {
    parent.setState({selectedViewType: 'swipe'});
  }

  handleListTap = item => {
    this.props.navigation.navigate('PropertyDetails', {
      address: item.propAddress.streetName,
      pdpUrl: item.listingUrl,
      imageUrl: item.imageUrl
    });
  }

  handleFavTap = item => {
    Alert.alert('Favorite Clicked');
  }

  onPanDragStart() {
    this.setState ({
      isMapDraggedManually: true
    });
    console.log('onPanDragStart');
  }

  // onPanDragStop() {
  //   console.log('onPanDragStop');
  // }

  handleFilterTap() {
    this.props.navigation.navigate('Filter');
  }

  handlePress () {
    console.log("called");
  }

  ListItemSeparator = () => {
    return (
      <View
        style={{
          height: .5,
          width: "100%",
          backgroundColor: "#000",
        }}
      />
    );
  }

  fetchListCall = (searchUrlStr) => {
    return fetch('https://www.owners.com/' + searchUrlStr + '?ajaxsearch=true')
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.state.currentListPageIndex > 1) {
          var propertiesArr = []
          if ( responseJson.data != null) {
            propertiesArr = responseJson.data.property ? responseJson.data.property : []
          }
          this.setState({
            isLoading: false,
            dataSource: [],
            listDatasource: [...this.state.listDatasource, ...propertiesArr],
            listPropsResultCount: responseJson.data.resultCount ? responseJson.data.resultCount : 0
            
          }, function () {
            // In this block you can do something with new state.
          });
        }
        else {

          var propertiesArr = []
          if ( responseJson.data != null) {
            propertiesArr = responseJson.data.property ? responseJson.data.property : []
          }

          this.setState({
            isLoading: false,
            dataSource: [],
            listDatasource: propertiesArr,
            listPropsResultCount: responseJson.data.resultCount ? responseJson.data.resultCount : 0,
            nextPageListDatasource: []
          }, function () {
            // In this block you can do something with new state.
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });

  }

  fetchMapCall = (searchUrlStr) => {
    console.log("Map Call#######"+'https://www.owners.com/'+ searchUrlStr + '?ajaxsearch=true&view=map');
    return fetch('https://www.owners.com/' + searchUrlStr + '?ajaxsearch=true&view=map')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          dataSource: [],
          mapDatasource: responseJson.data ? responseJson.data : [],
          isPropertyDetails: responseJson.data.propertyDetails ? responseJson.data.propertyDetails : false,
          listPropsResultCount: responseJson.data.resultCount ? responseJson.data.resultCount : 0
          
        }, function () {
          // In this block you can do something with new state.
        });
      })
      .catch((error) => {
        console.error(error);
      });

  }

  fetchBoundaryListCall = (searchUrlStr, topLeftX, topLeftY, bottomRightX, bottomRightY, centerPointLat, centerPointLong) => {
    let boundarUrlStr = "?topLeftX=" + topLeftX + "&topLeftY=" + topLeftY + "&bottomRightX=" + bottomRightX + "&bottomRightY=" + bottomRightY + "&rect=true" + "&centerPoint=" + centerPointLat + "," + centerPointLong;
    return fetch('https://www.owners.com/' + searchUrlStr + boundarUrlStr + '&ajaxsearch=true')
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.state.currentListPageIndex > 1) {
          var propertiesArr = []
          if ( responseJson.data != null) {
            propertiesArr = responseJson.data.property ? responseJson.data.property : []
          }
          this.setState({
            isLoading: false,
            dataSource: [],
            listDatasource: [...this.state.listDatasource, ...propertiesArr],
            listPropsResultCount: responseJson.data.resultCount ? responseJson.data.resultCount : 0
            
          }, function () {
            // In this block you can do something with new state.
          });
        }
        else {

          var propertiesArr = []
          if ( responseJson.data != null) {
            propertiesArr = responseJson.data.property ? responseJson.data.property : []
          }

          this.setState({
            isLoading: false,
            dataSource: [],
            listDatasource: propertiesArr,
            listPropsResultCount: responseJson.data.resultCount ? responseJson.data.resultCount : 0,
            nextPageListDatasource: []
          }, function () {
            // In this block you can do something with new state.
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });

  }

  fetchBoundaryMapCall = (searchUrlStr, topLeftX, topLeftY, bottomRightX, bottomRightY, centerPointLat, centerPointLong) => {
    let boundarUrlStr = "?topLeftX=" + topLeftX + "&topLeftY=" + topLeftY + "&bottomRightX=" + bottomRightX + "&bottomRightY=" + bottomRightY + "&rect=true" + "&centerPoint=" + centerPointLat + "," + centerPointLong;
    let completeURLStr = 'https://www.owners.com/' + searchUrlStr + boundarUrlStr + '&ajaxsearch=true&view=map';
    console.log('fetchBoundaryMapCallcompleteURL$$$$$$:' + completeURLStr);
    return fetch('https://www.owners.com/' + searchUrlStr + boundarUrlStr + '&ajaxsearch=true&view=map')
      .then((response) => response.json())
      .then((responseJson) => {
        let propDetails = responseJson.data.propertyDetails ? responseJson.data.propertyDetails : false
        console.log("propDetails$$$$$$$$$$$"+propDetails);
        this.setState({
          isLoading: false,
          dataSource: [],
          mapDatasource: responseJson.data ? responseJson.data : [],
          isPropertyDetails: propDetails,
          listPropsResultCount: responseJson.data.resultCount ? responseJson.data.resultCount : 0
          
        }, function () {
          // In this block you can do something with new state.
        });
      })
      .catch((error) => {
        console.error(error);
      });

  }

  getSearchURL = (postData) => {
    return fetch('https://www.owners.com/getSearchUrl', postData)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          currentListPageIndex: 1,
          currentSearchURL: responseJson.url
        }, function () {
          // In this block you can do something with new state.
        });
        this.fetchListCall(this.state.currentSearchURL)
        this.fetchMapCall(this.state.currentSearchURL)
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getCentroid = (polygonId) => {
    return fetch('https://www.owners.com/centroidlocation?id=' + polygonId)
      .then((response) => response.json())
      .then((responseJson) => {
        let boundaryPolygonCoordinates = responseJson.boundingPolygonCoordinates
        this.setState ({
          polygonCoordinates: boundaryPolygonCoordinates
         }, function () {
           // In this block you can do something with new state.
         }
         );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  suggestionsWebCall = (suggestionText) => {
    return fetch('https://www.owners.com/suggest?query=' + suggestionText)
      .then((response) => response.json())
      .then((responseJson) => {
        var suggestionsArr = [];
        if (responseJson.message != "system.error") {
          var placesArr = [];
          responseJson.suggestions.Place.STATE.forEach(element => {
            placesArr.push(element);
          });
          responseJson.suggestions.Place.CITY.forEach(element => {
            placesArr.push(element);
          });
          responseJson.suggestions.Place.PLACE.forEach(element => {
            placesArr.push(element)
          });
          responseJson.suggestions.Place.NEIGHBORHOOD.forEach(element => {
            placesArr.push(element)
          });
          responseJson.suggestions.Place.COUNTY.forEach(element => {
            placesArr.push(element)
          });
          responseJson.suggestions.Place.ZIP.forEach(element => {
            placesArr.push(element);
          });
          if (placesArr.length > 0) {
            suggestionsArr.push({ title: "Place", data: placesArr, key: "Place", index:0});
          }

          var schoolsArr = [];
          responseJson.suggestions.Schools.SCHOOL_DISTRICT.forEach(element => {
            schoolsArr.push(element);
          });
          responseJson.suggestions.Schools.PRIVATE_SCHOOL.forEach(element => {
            schoolsArr.push(element);
          });
          responseJson.suggestions.Schools.PUBLIC_SCHOOL.forEach(element => {
            schoolsArr.push(element);
          });
          if (schoolsArr.length > 0) {
            suggestionsArr.push({ title: "Schools", data: schoolsArr, key: "Schools", index:1});
          }

          var listingsArr = [];
          responseJson.suggestions.Listings.MLS_ID.forEach(element => {
            listingsArr.push(element);
          });
          responseJson.suggestions.Listings.LISTING_ID.forEach(element => {
            listingsArr.push(element);
          });
          if (listingsArr.length > 0) {
            suggestionsArr.push({ title: "Listings", data: listingsArr, key: "Listings", index:2});
          }

          var addresesArr = [];
          responseJson.suggestions.Address.ADDRESS.forEach(element => {
            addresesArr.push(element);
          });
          if (addresesArr.length > 0) {
            suggestionsArr.push({ title: "Address", data: addresesArr, key: "Address", index:3});
          }
        }

        this.setState({
          isLoading: false,
          dataSource: responseJson.message == "system.error" ? [] : suggestionsArr,
          listDatasource: [],
          mapDatasource: [],
          searchText: suggestionText
        }, function () {
          // In this block you can do something with new state.
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  _fecthSuggestions(exnteredText) {
    if (exnteredText.length > 1) {
      this.suggestionsWebCall(exnteredText)
    }
    else {
      this.setState({
        isLoading: false,
        dataSource: [],
        listDatasource: [],
        mapDatasource: []
      }, function () {
        // In this block you can do something with new state.
      });
    }
  }

  componentWillMount = () => {
    // navigator.geolocation.clearWatch(this.watchID);
  }

  componentDidUpdate = () => {
    console.log("updated.......")
  }

  componentDidMount() {
    // this.webCall();
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }
        });
      },
      (error) => console.log(error.message),
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000}
    );

    <ContainerView parent = {this} dataSource = {this.state.dataSource} polygonCoordinates = {this.state.polygonCoordinates} isLoading = {this.state.isLoading} mapDatasource = {this.state.mapDatasource} listDatasource = {this.state.listDatasource} searchText = {this.state.searchText} selectedViewType = {this.state.selectedViewType} listPropsResultCount = {this.state.listPropsResultCount}>
        </ContainerView>

    // this.watchID = navigator.geolocation.watchPosition(
    //   position => {
    //     this.setState({
    //       region: {
    //         latitude: position.latitude,
    //         longitude: position.longitude,
    //         latitudeDelta: LATITUDE_DELTA,
    //         longitudeDelta: LONGITUDE_DELTA
    //       }
    //     });
    //   }
    // );
  }


  calculatedPriceString = (propsArr) => {
    // return "$ 10";
    if (propsArr.length > 1) {
      return propsArr.length + " Units"
    }
    let priceStr = propsArr[0].listPrice
    var format = 0;
    var suffix = "";
    var transformedValue = 0.0;
    let priceIntVal = parseInt(priceStr, 10);
    if (priceIntVal >= 1000000000) {
      format = (priceIntVal % 1000000000 == 0) ? 0 : 1;
      suffix = "b";
      transformedValue = parseFloat(priceIntVal) / 1000000000.0
    }
    else if (priceIntVal >= 1000000) {
      format = (priceIntVal % 1000000 == 0)  ? 0 : 1;
      suffix = "m";
      transformedValue = parseFloat(priceIntVal) / 1000000.0
    }
    else if (priceIntVal >= 1000) {
      format = (priceIntVal % 1000 == 0)  ? 0 : 1;
      suffix = "k";
      transformedValue = parseFloat(priceIntVal) / 1000.0;
    }
    else {
      format = 0;
      suffix = "";
      transformedValue = parseFloat(priceIntVal);
    }
   return "$" + transformedValue.toFixed(format) + suffix;
  }

  suggestionClicked(suggestionItem) {
    this.getCentroid(suggestionItem.id ? suggestionItem.id : "")
    this.setState({
      isLoading: true,
      dataSource: [],
      listDatasource: [],
      mapDatasource: [],
      listPropsResultCount: 0
    }, function () {
      // In this block you can do something with new state.
    });

    let data = {
      method: 'POST',
      credentials: 'same-origin',
      mode: 'same-origin',
      body: JSON.stringify({
        "id": suggestionItem.id ? suggestionItem.id : "", //Polygon ID
        "assessorId": suggestionItem.assessorId ? suggestionItem.assessorId : "",
        "type": suggestionItem.type ? suggestionItem.type : "",
        "polygonRequest": { "name": JSON.parse(suggestionItem.jsonResult).name ? JSON.parse(suggestionItem.jsonResult).name : "", "state": JSON.parse(suggestionItem.jsonResult).state ? JSON.parse(suggestionItem.jsonResult).state : "", "zip": JSON.parse(suggestionItem.jsonResult).zip ? JSON.parse(suggestionItem.jsonResult).zip : "", "streetName": JSON.parse(suggestionItem.jsonResult).streetName ? JSON.parse(suggestionItem.jsonResult).streetName : "", "city": JSON.parse(suggestionItem.jsonResult).city ? JSON.parse(suggestionItem.jsonResult).city : "" }
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': ''
      }
    }
    this.getSearchURL(data)
  }

  _listEmptyComponent = () => {
    return (
      <View style={{ flex: 1, backgroundColor: 'green' }}>
        <Text style={styles.headerText}>TEst Test Test</Text>
      </View>
    )
  }

  onRegionChangeComplete = (region) => {
    if (this.state.isMapDraggedManually == true) {
      this.state.isMapDraggedManually = false
      if (this.state.currentSearchURL.length > 0) {
        let topleftY = region.longitude - region.longitudeDelta/2; // westLng - min lng
        let bottomRightX = region.latitude - region.latitudeDelta/2; // southLat - min lat
        let bottomRightY = region.longitude + region.longitudeDelta/2; // eastLng - max lng
        let topleftX = region.latitude + region.latitudeDelta/2; // northLat - max lat

        let centreLat = region.latitude;
        let centreLong = region.longitude;
        this.fetchBoundaryMapCall(this.state.currentSearchURL, topleftX, topleftY, bottomRightX, bottomRightY, centreLat, centreLong);
        this.fetchBoundaryListCall(this.state.currentSearchURL, topleftX, topleftY, bottomRightX, bottomRightY, centreLat, centreLong);
      }
    }
  }

  onClusterClick = () => {
    this.setState ({
      isMapDraggedManually: true
    });
  }

  onPressMarker = (index) => {
    console.log("index#######"+index);
  }

  render() {
    console.disableYellowBox = true
    return(
      <ContainerView parent = {this} dataSource = {this.state.dataSource} polygonCoordinates = {this.state.polygonCoordinates} isLoading = {this.state.isLoading} mapDatasource = {this.state.mapDatasource} listDatasource = {this.state.listDatasource} searchText = {this.state.searchText} selectedViewType = {this.state.selectedViewType}>
        </ContainerView>
    );
  }
}
export default Search;
const styles = StyleSheet.create({

  mapContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
  },

  mainContainer: {
    justifyContent: 'flex-start',
    flex: 1,
    margin: 0,
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
  header: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    backgroundColor: '#1F47AF',
    fontWeight: 'bold',
    fontSize: 20,
    flexDirection: 'row',
    color: 'white'
  },

  headerText: {
    color: 'white',
    padding: 14,
    alignItems: 'flex-end',
    fontWeight: 'bold',
    fontSize: 12,
  },

  highlightedHeaderText: {
    color: '#1F47AF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },

  highlightedBackground: {
    margin: 5,
    backgroundColor: 'white',
    borderWidth: 0,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#8C8E9B',
  },

  subHeaderText: {
    flex: 1,
    color: '#8C8E9B',
    padding: 8,
    alignItems: 'flex-end',
    fontWeight: 'bold',
    fontSize: 12,
  },

  headerFilterTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  favContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 3,
  },

  mlsLogoContainer: {
    flex: 1,
    alignSelf: 'flex-start',
    padding: 0,
    position: 'relative'
  },

  searchHeader: {
    width: '100%',
    textAlign: 'left',
    backgroundColor: '#CCC',
    fontWeight: 'bold',
    fontSize: 14
  },
  input: {
    margin: 3,
    height: 45,
    padding: 8,
    borderColor: '#8C8E9B',
    backgroundColor: 'white',
    borderWidth: 0,
    borderRadius: 2,
    fontWeight: 'bold'
  },
  footer: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'skyblue',
    fontWeight: 'bold',
    fontSize: 20

  },
  flatListStyle: {
    top: -40,
    backgroundColor: 'white',
    marginBottom: -40
  },
  listFlatListRelativeStyle: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '0%',
    height: '0%'
  },
  listFlatListAbsoluteStyle: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height : '100%'
  },
  level1BlueTextStyle: {
    fontSize: 15,
    color: '#0B2B80'
  },
  level1GreyTextStyle: {
    fontSize: 15,
    color: '#8C8E9B'
  },
  level2TextStyle: {
    fontSize: 13,
    color: '#8C8E9B'
  },
  sectionHeaderStyle: {
    fontSize: 13,
    color: 'black',
    marginHorizontal: 4,
    paddingVertical: 2,
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 30,
    height: 15,
    borderRadius: 0,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130,4,150, 0.3)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(130,4,150, 0.5)",
  },
  mapListContainer: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  clusterContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C2D7F',
  },
  clusterTextiOS: {
    fontSize: 10,
    marginTop: 3,
    color: '#FFFFFF',
    textAlignVertical: "center",
    textAlign: "center",
  },
  clusterTextAndroid: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlignVertical: "center",
    textAlign: "center",
  },
});

