import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  TextInput,
  Platform,
} from 'react-native';
import NetworkRequestInfo from '../NetworkRequestInfo';
import { useThemedStyles, Theme } from '../theme';
import { backHandlerSet } from '../backHandler';
import ResultItem from './ResultItem';
import Header from './Header';
import Button from './Button';

interface Props {
  request: NetworkRequestInfo;
  onClose(): void;
}

const Headers = ({
  title = 'Headers',
  headers,
  onPress,
}: {
  title: string;
  headers?: Object;
  onPress?: () => void;
}) => {
  const styles = useThemedStyles(themedStyles);
  return (
    <View>
      <Header
        onPressArrow={onPress}
        shareContent={headers && JSON.stringify(headers, null, 2)}
      >
        {title}
      </Header>
      <View style={styles.content}>
        {Object.entries(headers || {}).map(([name, value]) => (
          <View style={styles.headerContainer} key={name}>
            <Text style={styles.headerKey}>{name}: </Text>
            <Text style={styles.headerValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const LargeText: React.FC<{ children: string }> = ({ children }) => {
  const styles = useThemedStyles(themedStyles);

  if (Platform.OS === 'ios') {
    /**
     * A readonly TextInput is used because large Text blocks sometimes don't render on iOS
     * See this issue https://github.com/facebook/react-native/issues/19453
     * Note: Even with the fix mentioned in the comments, text with ~10,000 lines still fails to render
     */
    return (
      <TextInput
        style={[styles.content, styles.largeContent]}
        multiline
        editable={false}
        value={children}
      />
    );
  }

  return (
    <View style={styles.largeContent}>
      <ScrollView nestedScrollEnabled>
        <View>
          <Text style={styles.content} selectable>
            {children}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const RequestDetails: React.FC<Props> = ({ request, onClose }) => {
  const [responseBody, setResponseBody] = useState('Loading...');
  const styles = useThemedStyles(themedStyles);
  const [objNetwork, setObjNetwork] = useState({
    isShowReqHeader: false,
    isShowReqBody: false,
    isShowRepHeader: false,
    isShowRepBody: true,
  });

  useEffect(() => {
    (async () => {
      const body = await request.getResponseBody();
      setResponseBody(body);
    })();
  }, [request]);

  const requestBody = request.getRequestBody(!!request.gqlOperation);

  const getFullRequest = () => {
    let response;
    if (responseBody) {
      try {
        response = JSON.parse(responseBody);
      } catch {
        response = `${responseBody}`;
      }
    }
    const processedRequest = {
      ...request,
      response,
      duration: request.duration,
    };
    return JSON.stringify(processedRequest, null, 2);
  };

  return (
    <View style={styles.container}>
      <ResultItem request={request} style={styles.info} />
      <ScrollView style={styles.scrollView} nestedScrollEnabled bounces={false}>
        <Headers
          title="Request Headers"
          headers={
            objNetwork?.isShowReqHeader ? request.requestHeaders : undefined
          }
          onPress={() => {
            setObjNetwork((pre) => ({
              ...pre,
              isShowReqHeader: !pre.isShowReqHeader,
            }));
          }}
        />
        <Header
          shareContent={requestBody}
          onPressArrow={() => {
            setObjNetwork((pre) => ({
              ...pre,
              isShowReqBody: !pre.isShowReqBody,
            }));
          }}
        >
          Request Body
        </Header>
        <LargeText>{objNetwork?.isShowReqBody ? requestBody : ''}</LargeText>
        <Headers
          title="Response Headers"
          headers={
            objNetwork?.isShowRepHeader ? request.responseHeaders : undefined
          }
          onPress={() => {
            setObjNetwork((pre) => ({
              ...pre,
              isShowRepHeader: !pre.isShowRepHeader,
            }));
          }}
        />
        <Header
          shareContent={responseBody}
          onPressArrow={() => {
            setObjNetwork((pre) => ({
              ...pre,
              isShowRepBody: !pre.isShowRepBody,
            }));
          }}
        >
          Response Body
        </Header>
        <LargeText>{objNetwork?.isShowRepBody ? responseBody : ''}</LargeText>
        <Header>More</Header>
        <View style={styles.vwFooter}>
          <Button
            onPress={() => Share.share({ message: getFullRequest() })}
            // fullWidth
          >
            {'𝙁𝙪𝙡𝙡♡𝙍𝙚𝙦☯'}
          </Button>
          <Button
            onPress={() => Share.share({ message: request.curlRequest })}
            // fullWidth
          >
            {'☂CມR꒒☆'}
          </Button>
        </View>
      </ScrollView>
      {!backHandlerSet() && (
        <Button onPress={onClose} style={styles.close}>
          {'☂🄲ʆọśe̥ͦ亗'}
        </Button>
      )}
    </View>
  );
};

const themedStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10,
    },
    info: {
      margin: 0,
    },
    close: {
      position: 'absolute',
      right: 10,
      top: 0,
    },
    scrollView: {
      width: '100%',
    },
    headerContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    headerKey: { fontWeight: 'bold', color: theme.colors.text },
    headerValue: { color: theme.colors.text },
    text: {
      fontSize: 16,
      color: theme.colors.text,
    },
    content: {
      backgroundColor: theme.colors.card,
      padding: 10,
      color: theme.colors.text,
    },
    largeContent: {
      maxHeight: 300,
    },
    vwFooter: {
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'space-around',
      marginHorizontal: 16,
      alignItems: 'center',
    },
  });

export default RequestDetails;
