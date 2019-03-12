'use-strict'

// base libs
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  Platform,
  Dimensions,
  LayoutAnimation
} from 'react-native'
// map-related libs
import MapView from 'react-native-maps'
import SuperCluster from 'supercluster'
import GeoViewport from '@mapbox/geo-viewport'
// components / views
import ClusterMarker from '../node_modules/react-native-maps-super-cluster/ClusterMarker'
// libs / utils
import {
  regionToBoundingBox,
  itemToGeoJSONFeature
} from '../node_modules/react-native-maps-super-cluster/util'

export default class ClusteredMapView extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      data: [], // helds renderable clusters and markers
      region: props.region || props.initialRegion, // helds current map region
      isClusterTapped: false // custom property added by us, to avoid calling regioncomplete method twice
    }

    this.isAndroid = Platform.OS === 'android'
    this.dimensions = [props.width, props.height]

    this.mapRef = this.mapRef.bind(this)
    this.onClusterPress = this.onClusterPress.bind(this)
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this)
  }

  componentDidMount() {
    this.clusterize(this.props.data)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data)
      this.clusterize(nextProps.data)
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.isAndroid && this.props.animateClusters && this.clustersChanged(nextState))
      LayoutAnimation.configureNext(this.props.layoutAnimationConf)
  }

  mapRef = (ref) => {
    this.mapview = ref
  }

  getMapRef = () => this.mapview

  getClusteringEngine = () => this.index

  clusterize = (dataset) => {
    this.index = SuperCluster({ // eslint-disable-line new-cap
      extent: this.props.extent,
      minZoom: this.props.minZoom,
      maxZoom: this.props.maxZoom,
      radius: this.props.radius || (this.dimensions[0] * .045), // 4.5% of screen width
    })

    // get formatted GeoPoints for cluster
    const rawData = dataset.map(itemToGeoJSONFeature)

    // load geopoints into SuperCluster
    this.index.load(rawData)

    const data = this.getClusters(this.state.region)
    this.setState({ data })
  }

  clustersChanged = (nextState) => this.state.data.length !== nextState.data.length

  onRegionChangeComplete = (region) => {
    // let data
    if (region.longitudeDelta <= 80) {
      let data = this.getClusters(region)
      this.setState({ region, data }, () => {
        this.props.onRegionChangeComplete && this.props.onRegionChangeComplete(region, data)
      })
    } else {
      this.props.onRegionChangeComplete && this.props.onRegionChangeComplete(region, data)
    }
    
    if (this.state.isClusterTapped == false) {
      const { onClusterPressed } = this.props;
        onClusterPressed();
      const { regionChanged } = this.props;
      regionChanged(region);  
    }
    else {
      this.state.isClusterTapped = false;
    }
  }

  getClusters = (region) => {
    const bbox = regionToBoundingBox(region),
          viewport = (region.longitudeDelta) >= 40 ? { zoom: this.props.minZoom } : GeoViewport.viewport(bbox, this.dimensions)

    return this.index.getClusters(bbox, viewport.zoom)
  }

  onClusterPress = (cluster) => {
    
    if (cluster.properties.point_count > 0) {
         // cluster press behavior might be extremely custom.
        if (!this.props.preserveClusterPressBehavior) {
          this.props.onClusterPress && this.props.onClusterPress(cluster.properties.cluster_id)
          return
        }

        // //////////////////////////////////////////////////////////////////////////////////
        // NEW IMPLEMENTATION (with fitToCoordinates)
        // //////////////////////////////////////////////////////////////////////////////////
        // get cluster children
        const children = this.index.getLeaves(cluster.properties.cluster_id, this.props.clusterPressMaxChildren),
              markers = children.map(c => c.properties.item)

        // fit right around them, considering edge padding
        this.mapview.fitToCoordinates(markers.map(m => m.location), { edgePadding: this.props.edgePadding })

        this.props.onClusterPress && this.props.onClusterPress(cluster.properties.cluster_id, markers)
        const { onClusterPressed } = this.props;
        onClusterPressed();
    }
    else {

      let location = {
        latitude: parseFloat(cluster.properties.item.location.latitude),
        longitude: parseFloat(cluster.properties.item.location.longitude)
      }


      var markers = []
      markers.push(location)
        this.mapview.fitToCoordinates(markers, { edgePadding: this.props.edgePadding })

        // this.props.onClusterPress && this.props.onClusterPress(cluster.properties.cluster_id, [])
        const { onClusterPressed } = this.props;
        onClusterPressed();
        this.state.isClusterTapped = true;
    }

    
   
  }

  render() {
    return (
      <MapView
        { ...this.props}
        ref={this.mapRef}
        onRegionChangeComplete={this.onRegionChangeComplete.bind(this)}
        >
        {
          this.props.clusteringEnabled && this.state.data.map((d) => {
            // if (d.properties.point_count === 0)
            //   return this.props.renderMarker(d.properties.item)

            return (
              <ClusterMarker
                {...d}
                onPress={this.onClusterPress}
                textStyle={this.props.textStyle}
                scaleUpRatio={this.props.scaleUpRatio}
                renderCluster={this.props.renderCluster}
                // key={`cluster-${d.properties.cluster_id}`}
                containerStyle={this.props.containerStyle}
                clusterInitialFontSize={this.props.clusterInitialFontSize}
                clusterInitialDimension={this.props.clusterInitialDimension} 
                />
            )
          })
        }
        {
          !this.props.clusteringEnabled && this.props.data.map(d => this.props.renderMarker(d))
        }
        {this.props.children}
      </MapView>
    )
  }
}

ClusteredMapView.defaultProps = {
  minZoom: 1,
  maxZoom: 20,
  extent: 150,//Value changed from default val
  textStyle: {},
  containerStyle: {},
  animateClusters: true,
  clusteringEnabled: true,
  clusterInitialFontSize: 12,
  clusterInitialDimension: 30,
  clusterPressMaxChildren: 100,
  preserveClusterPressBehavior: true,
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  layoutAnimationConf: LayoutAnimation.Presets.spring,
  edgePadding: { top: 10, left: 10, right: 10, bottom: 10 }
}

ClusteredMapView.propTypes = {
  ...MapView.propTypes,
  // number
  radius: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  extent: PropTypes.number.isRequired,
  minZoom: PropTypes.number.isRequired,
  maxZoom: PropTypes.number.isRequired,
  clusterInitialFontSize: PropTypes.number.isRequired,
  clusterPressMaxChildren: PropTypes.number.isRequired,
  clusterInitialDimension: PropTypes.number.isRequired,
  // array
  data: PropTypes.array.isRequired,
  // func
  onExplode: PropTypes.func,
  onImplode: PropTypes.func,
  scaleUpRatio: PropTypes.func,
  renderCluster: PropTypes.func,
  onClusterPress: PropTypes.func,
  renderMarker: PropTypes.func.isRequired,
  // bool
  animateClusters: PropTypes.bool.isRequired,
  clusteringEnabled: PropTypes.bool.isRequired,
  preserveClusterPressBehavior: PropTypes.bool.isRequired,
  // object
  textStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  layoutAnimationConf: PropTypes.object,
  edgePadding: PropTypes.object.isRequired,
  // string

  regionChanged: PropTypes.func.isRequired,
  onClusterPressed: PropTypes.func.isRequired,
  //Custom
}