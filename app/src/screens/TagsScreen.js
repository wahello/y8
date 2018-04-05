import React from 'react';
import {
  View,
  Platform,
  FlatList,
  Keyboard,
  Text,
  UIManager,
  ScrollView,
  RefreshControl,
  LayoutAnimation,
  KeyboardAvoidingView
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import Feather from 'react-native-vector-icons/Feather';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';

import TextButton from '../components/TextButton';
import TagItem from '../components/TagItem';
import SearchBar from '../components/SearchBar';
import UsedTagsItem from '../components/UsedTagsItem';
import { SearchTags } from '../services/TagService';
import {
  getTags,
  addTag,
  updateTag,
  deleteTag,
} from '../actions/TagActions';

// import {
//   //addTagsGroupToMyActivity,
//   //removeTagFromGroup,
//   //removeGroupFromActivity,
// } from '../actions/MyActivityActions';

import {
  getGroupsByActivity,
  addTagsGroupToMyActivity,
  useThisGroupForActivity,
  removeTagFromGroup,
  removeGroupFromActivity
} from '../actions/GroupActions';

class TagsScreen extends React.Component {
  static navigatorStyle = {
    navBarNoBorder: true
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tag: null,
      searchIds: [],
      isSearchOn: false,
      selectedTags: [],
      sentence: '',
      activity: null,
      selectedIndex: 0,
      SegmentedControlTabTopPadding: 0
    };
    this.timeout = 0;
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
       UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  componentDidMount() {
    const { activity } = this.props;
    this.props.getGroupsByActivity(activity.id);
    const groups = this.props.myActivities.byActivityId[activity.id];
    let hasTags = false;
    if (!_.isEmpty(groups) && !_.isEmpty(groups.allGroupIds)) {
      hasTags = groups.allGroupIds.length > 0;
    }

    if (hasTags) {
      this.props.navigator.setButtons({
        rightButtons: []
      });
    }

    this.setState({
      activity,
      selectedIndex: hasTags ? 0 : 1
    });

    if (this.props.navigator) {
      // Feather.getImageSource('plus', 30, EStyleSheet.value('$iconColor')).then((source) => {
      //   this.props.navigator.setButtons({
      //     rightButtons: [{
      //       id: 'add',
      //       icon: source,
      //       disableIconTint: true, // disable default color,
      //     }]
      //   });
      // });
      // if you want to listen on navigator events, set this up
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }

    //this.props.getTags();
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  async componentDidUpdate(nextProps) {
    //console.log('componentDidUpdate', nextProps.myActivities.removingTag, this.props.myActivities.removingTag, this.props.myActivities.error);

    if (nextProps.myActivities.removingTag &&
      !this.props.myActivities.removingTag &&
      _.isNull(this.props.myActivities.error)) {
      await this.showSnackBar('Tag removed from group');
    } else if (nextProps.myActivities.removingTag &&
      !this.props.myActivities.removingTag &&
      !_.isNil(this.props.myActivities.error)) {
      await this.showSnackBar(this.props.myActivities.error.data);
    } else if (nextProps.myActivities.removingTag &&
      !this.props.myActivities.removingTag &&
      _.isUndefined(this.props.myActivities.error)) {
      await this.showSnackBar('Service down, please try later');
    }

    if (nextProps.myActivities.removingGroup &&
      !this.props.myActivities.removingGroup &&
      _.isNull(this.props.myActivities.error)) {
      await this.showSnackBar('Group removed from activity');
    } else if (nextProps.myActivities.removingGroup &&
      !this.props.myActivities.removingGroup &&
      !_.isNull(this.props.myActivities.error) &&
      !_.isUndefined(this.props.myActivities.error)) {
      await this.showSnackBar(this.props.myActivities.error.data);
    } else if (nextProps.myActivities.removingGroup &&
      !this.props.myActivities.removingGroup &&
      _.isUndefined(this.props.myActivities.error)) {
      await this.showSnackBar('Service down, please try later');
    }

    if (nextProps.tags.adding &&
      !this.props.tags.adding &&
      _.isNull(this.props.tags.addingError)) {
      await this.showSnackBar('Tag created!');
    } else if (nextProps.tags.adding &&
      !this.props.tags.adding &&
      !_.isNull(this.props.tags.addingError) &&
      !_.isUndefined(this.props.tags.addingError)) {
      await this.showSnackBar(this.props.tags.addingError.data);
    } else if (nextProps.tags.adding &&
      !this.props.tags.adding &&
      _.isUndefined(this.props.tags.addingError)) {
      await this.showSnackBar('Service down, please try later');
    }

    if (nextProps.tags.updating &&
      !this.props.tags.updating &&
      _.isNull(this.props.tags.updatingError)) {
      await this.showSnackBar('Tag updated!');
    } else if (nextProps.tags.updating &&
      !this.props.tags.updating &&
      !_.isNull(this.props.tags.updatingError) &&
      !_.isUndefined(this.props.tags.updatingError)) {
      await this.showSnackBar(this.props.tags.updatingError.data);
    } else if (nextProps.tags.updating &&
      !this.props.tags.updating &&
      _.isUndefined(this.props.tags.updatingError)) {
      await this.showSnackBar('Service down, please try later');
    }

    if (nextProps.tags.deleting &&
      !this.props.tags.deleting &&
      _.isNull(this.props.tags.deletingError)) {
      await this.showSnackBar('Tag deleted!');
    } else if (nextProps.tags.deleting &&
      !this.props.tags.deleting &&
      !_.isNull(this.props.tags.deletingError) &&
      !_.isUndefined(this.props.tags.deletingError)) {
      await this.showSnackBar(this.props.tags.deletingError.data);
    } else if (nextProps.tags.deleting &&
      !this.props.tags.deleting &&
      _.isUndefined(this.props.tags.deletingError)) {
      await this.showSnackBar('Service down, please try later');
    }

    /*
    if (nextProps.tags.adding === true &&
      this.props.tags.adding === false &&
      nextProps.tags.addingError === null) {
      await this.showSnackBar('Tag created!');
    } else if (nextProps.tags.adding === true &&
      this.props.tags.adding === false &&
      nextProps.tags.addingError !== null) {
      await this.showSnackBar('TODO:Network error');
    } else if (nextProps.tags.updating === true &&
      this.props.tags.updating === false &&
      nextProps.tags.updatingError === null) {
      await this.showSnackBar('Tag Updated!');
    } else if (nextProps.tags.updating === true &&
      this.props.tags.updating === false &&
      nextProps.tags.updatingError !== null) {
      await this.showSnackBar('TODO:Network error');
    } else if (nextProps.tags.deleting === true &&
      this.props.tags.deleting === false &&
      nextProps.tags.deletingError === null) {
      await this.showSnackBar('Tag deleted!');
    } else if (nextProps.tags.deleting === true &&
      this.props.tags.deleting === false &&
      nextProps.tags.deletingError !== null) {
      await this.showSnackBar('TODO:Network error');
    }*/
  }


  onNavigatorEvent = (event) => {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'add' && this.props.navigator) {
        this.props.navigator.showModal({
          screen: 'app.TagModal',
          title: 'Create Tags',
          passProps: {
            tag: null,
            tags: this.props.tags
          },
          navigatorStyle: {
            navBarTextColor: EStyleSheet.value('$textColor')
          },
          animationType: 'slide-up'
        });
      }
    }
  };

  onEdit = (id) => {
    this.props.navigator.showModal({
      screen: 'app.TagModal',
      title: 'Update Tag',
      passProps: {
        tag: this.props.tags.byId[id],
        tags: this.props.tags
      },
      navigatorStyle: {},
      animationType: 'slide-up'
    });
  }

  onItemPress = (checked, tagId) => {
    if (checked) {
      const selectedTags = [...this.state.selectedTags, tagId];
      //selectedTags.reverse();
      this.setState({
        selectedTags,
        sentence: selectedTags.map((id) => `${this.props.tags.byId[id].name} `)
      });
    } else {
      this.deleteTagFromSeletedTags(tagId);
    }
  }

  onSearchBarFocus = () => {
    this.setState({
      SegmentedControlTabTopPadding: 25
    }, () => {
      this.props.navigator.toggleNavBar({
        to: 'hidden', // required, 'hidden' = hide , 'shown' = show
        animated: true
      });
    });
  }

  onSearchCancel = () => {
    this.setState({
      SegmentedControlTabTopPadding: 0
    }, () => {
      this.props.navigator.toggleNavBar({
        to: 'shown', // required, 'hidden' = hide , 'shown' = show
        animated: true
      });
    });
  }

  onShare = (groupId, activity, sentence) => {
    //console.log(groupId, activity, sentence);
    this.props.navigator.push({
      screen: 'app.ShareScreen',
      title: 'Share',
      passProps: {
        prevGroupId: this.props.prevGroupId,
        prevTimeId: this.props.prevTimeId,
        activity,
        isExisted: true,
        groupId,
        //selectedTags: this.state.selectedTags,
        sentence,
        started: false
      },
      //backButtonTitle: 'Back',
      navigatorButtons: {}
    });
  }

  onRefresh = () => {
    this.props.getTags();
  }

  async componentWilUnmount() {
    await this.props.navigator.dismissAllModals({
      animationType: 'none'
    });
  }

  showSnackBar = (msg) => {
    Snackbar.show({
        title: msg,
        duration: Snackbar.LENGTH_SHORT,
    });
  }

  deleteTagFromSeletedTags = (tagId) => {
    const selectedTags = Object.assign([], this.state.selectedTags);
    const index = selectedTags.indexOf(tagId);
    if (index !== -1) {
      selectedTags.splice(index, 1);
      this.setState({
        selectedTags,
        sentence: selectedTags.map((id) => `${this.props.tags.byId[id].name} `)
      });
    }
  }

  handleSearchChangeText = (text) => {
    clearTimeout(this.timeout);

    if (text.length === 0) {
      this.setState({
        searchIds: [],
        isSearchOn: false
      });
    } else {
      let searchIds = [];
      this.timeout = setTimeout(() => {
        searchIds = SearchTags(this.props.tags.byId, text);
        this.setState({
          searchIds,
          isSearchOn: true
        });
      }, 800);
    }
  }

  handleSearchOnClear = () => {
    this.setState({
      searchIds: [],
      isSearchOn: false,
    });
  }

  scrollToOffset = () => {
    this.flatListRef.scrollToOffset({ x: 0, y: 0, animated: true });
  }

  addTagsGroupToMyActivity = () => {
    const { activity, selectedTags } = this.state;
    this.props.navigator.popToRoot({
      animated: true,
      animationType: 'fade',
    });
    this.props.addTagsGroupToMyActivity(activity, selectedTags, this.props.prevTimeId, this.props.prevGroupId);
  }

  useThisGroupForActivity = (activityId, groupId, prevTimeId, prevGroupId) => {
    this.props.navigator.popToRoot({
      animated: true,
      animationType: 'fade',
    });

    this.props.useThisGroupForActivity(activityId, groupId, prevTimeId, prevGroupId);
  }

  removeTagFromGroup = (activityId, groupId, tagId, onlyPrevGroupId) => {
    this.props.removeTagFromGroup(activityId, groupId, tagId, onlyPrevGroupId);
  }
  getPrevGroupIdFromOnlygroups = (id) => {
    const index = _.findIndex(this.props.onlygroups.data, { id });
    if (index !== -1 && index === 0 && !_.isNil(this.props.onlygroups.data[index + 1])) {
      return this.props.onlygroups.data[index + 1].id;
    }
    return null;
  }
  removeGroupFromActivity = (activityId, groupId, onlyPrevGroupId) => {
    this.props.removeGroupFromActivity(activityId, groupId, onlyPrevGroupId);
  }
  renderListHeader = () => {
    const { activity } = this.state;
    let name = '';
    if (!_.isNull(activity) && !_.isEmpty(activity)) {
      name = activity.name;
    }
    if (name === '') {
      return null;
    }
    name = name[0].toUpperCase() + name.slice(1).toLowerCase();
    return (
      <View
        style={{
          backgroundColor: EStyleSheet.value('$backgroundColor'),
          justifyContent: 'center',
          paddingBottom: 15,
          paddingTop: 5,
          paddingHorizontal: 10

        }}
      >
      <ScrollView
        style={{
          maxHeight: 80
        }}
      >
        <Text
          style={{
            fontSize: 17,
            color: EStyleSheet.value('$textColor')
            //flexGrow: 1,
          }}
        >{name} {this.state.sentence}</Text>
      </ScrollView>
      </View>
    );
  };
  renderListFooter= () => null;
  renderRow = ({ item }) => {
    //console.log(item);
    const { id, name } = this.props.tags.byId[item];
    return (
      <TagItem
        id={id}
        name={name}
        showEditIcon
        onEdit={this.onEdit}
        onItemPress={this.onItemPress}
        isChecked={this.state.selectedTags.indexOf(id) !== -1}
      />
    );
  };

  renderRowGroup = ({ item }) => {
    const onlyPrevGroupId = this.getPrevGroupIdFromOnlygroups(item.id);
    return (
      <UsedTagsItem
        prevGroupId={this.props.prevGroupId}
        prevTimeId={this.props.prevTimeId}
        activity={this.state.activity}
        groupId={item.id}
        tagsGroup={item.tags}
        onlyPrevGroupId={onlyPrevGroupId}
        tags={this.props.tags}
        removeTagFromGroup={this.removeTagFromGroup}
        removeGroupFromActivity={this.removeGroupFromActivity}
        useThisGroupForActivity={this.useThisGroupForActivity}
        onShare={this.onShare}
      />
    );
  };


  render() {
    const { tags, myActivities } = this.props;
    const { byActivityId } = myActivities;
    const { isSearchOn, searchIds, activity, selectedTags } = this.state;

    if (_.isNull(activity)) {
      return null;
    }
    return (
      <View style={styles.container}>
        <SegmentedControlTab
          tabsContainerStyle={{
            paddingTop: this.state.SegmentedControlTabTopPadding,
            paddingVertical: 10,
            paddingHorizontal: 30,
            backgroundColor: '#FFFFFF',
          }}
          tabStyle={{ borderColor: EStyleSheet.value('$iconColor') }}
          activeTabStyle={{ backgroundColor: EStyleSheet.value('$iconColor') }}
          tabTextStyle={{ color: EStyleSheet.value('$textColor'), fontWeight: '600' }}
          values={['Used Tags', 'Tags']}
          selectedIndex={this.state.selectedIndex}
          onTabPress={(selectedIndex) => {
            this.setState({
              selectedIndex
            }, () => {
              let showAdd = false;
              if (this.state.selectedIndex === 1) {
                showAdd = true;
              }
              if (showAdd) {
                Feather.getImageSource('plus', 30, EStyleSheet.value('$iconColor')).then((source) => {
                  this.props.navigator.setButtons({
                    rightButtons: [{
                      id: 'add',
                      icon: source,
                      disableIconTint: true, // disable default color,
                    }]
                  });
                });
              } else {
                Feather.getImageSource('plus', 30, EStyleSheet.value('$iconColor')).then((source) => {
                  this.props.navigator.setButtons({
                    rightButtons: []
                  });
                });
              }
            });
          }}
        />
        {
          this.state.selectedIndex === 1 &&

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={17}
          >
          <SearchBar
            onChangeText={this.handleSearchChangeText}
            onClear={this.handleSearchOnClear}
            onFocus={this.onSearchBarFocus}
            onCancel={this.onSearchCancel}
          />
          {this.renderListHeader()}
          {
            selectedTags.length > 0 &&
            <View
              style={{
                height: 35,
                backgroundColor: EStyleSheet.value('$backgroundColor'),
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                position: 'relative',
                //borderColor: 'gray',
                //borderBottomWidth: 1
                paddingBottom: 10,
              }}
            >
            {
              // <TextButton
              //   containerStyle={{ marginLeft: 10 }}
              //   title='Share'
              //   onPress={() => {
              //     this.props.navigator.push({
              //       screen: 'app.ShareScreen',
              //       title: 'Subscribers',
              //       passProps: {
              //         prevGroupId: this.props.prevGroupId,
              //         prevTimeId: this.props.prevTimeId,
              //         isExisted: false,
              //         activity: this.state.activity,
              //         selectedTags: this.state.selectedTags,
              //         sentence: this.state.sentence
              //       },
              //       //backButtonTitle: 'Back',
              //       navigatorButtons: {}
              //     });
              //    }}
              // />
            }
            <TextButton
              containerStyle={{
                borderWidth: 0.3,
                borderRadius: 3,
                borderColor: '#38B211',
                height: 25,
                marginRight: 10
              }}
              titleStyle={{
                fontSize: 14,
                color: '#38B211',
                fontWeight: '600'
              }}
              title='START'
              onPress={this.addTagsGroupToMyActivity}
            />
            </View>
          }
          <FlatList
            //removeClippedSubviews={false}
            keyboardShouldPersistTaps='always'
            ref={(ref) => { this.flatListRef = ref; }}
            extraData={tags}
            //ListHeaderComponent={this.renderListHeader}
            keyExtractor={item => item}
            data={
              isSearchOn ? searchIds : tags.allIds
            }
            renderItem={this.renderRow}
            ListFooterComponent={this.renderListFooter}
            refreshControl={
              <RefreshControl
                refreshing={tags.loading}
                onRefresh={this.onRefresh}
              />
            }
          />

          {/*
            <TagModal
              visible={this.state.visible}
              hideModal={this.hideModal}
              onModalHide={this.onModalHide}
              onModalShow={this.onModalShow}
              addTag={this.props.addTag}
              updateTag={this.props.updateTag}
              deleteTag={this.props.deleteTag}
              tag={this.state.tag}
              tags={tags}
            />
          */}

        </KeyboardAvoidingView>
      }
      {
        this.state.selectedIndex === 0 &&
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: EStyleSheet.value('$backgroundColor'),
              height: 40,
              justifyContent: 'center',

              //padding: 20,
              //paddingTop: 10,
              paddingLeft: 15,
              //paddingBottom: 0,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '500',
                color: EStyleSheet.value('$textColor')
              }}
            >
              {activity.name[0].toUpperCase() + activity.name.slice(1).toLowerCase()}
            </Text>
          </View>
          <FlatList
            //removeClippedSubviews={false}
            keyboardShouldPersistTaps='always'
            //ref={(ref) => { this.flatListRef = ref; }}
            extraData={this.props.onlygroups.data}
            //ListHeaderComponent={this.renderListHeader}
            keyExtractor={item => item.id}
            data={this.props.onlygroups.data}
            renderItem={this.renderRowGroup}
            ListFooterComponent={this.renderListFooter}
          />
        </View>
      }
        <Spinner
          visible={
            this.props.myActivities.removingTag ||
            this.props.myActivities.removingGroup ||
            this.props.tags.adding ||
            this.props.tags.updating ||
            this.props.tags.deleting
          }
          color={EStyleSheet.value('$textColor')}
          textContent={'Loading...'}
          textStyle={{ color: EStyleSheet.value('$textColor') }}
        />
      </View>

    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$backgroundColor',
  }
});

const mapStateToProps = (state) => {
  //console.log('TagsScreen:mapStateToProps:', state);
  const { tags, myActivities, onlygroups } = state;
  return {
    tags,
    myActivities,
    onlygroups
  };
};
export default connect(mapStateToProps, {
  getGroupsByActivity,
  getTags,
  addTag,
  updateTag,
  deleteTag,
  addTagsGroupToMyActivity,
  removeTagFromGroup,
  removeGroupFromActivity,
  useThisGroupForActivity
})(TagsScreen);
