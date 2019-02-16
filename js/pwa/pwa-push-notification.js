 
		     var config={
    apiKey: "AIzaSyD4j6TnswUNg7ny1weAdnLtk-ep5OYFRe0",
    authDomain: "hack-hex.firebaseapp.com",
    databaseURL: "https://hack-hex.firebaseio.com",
    projectId: "hack-hex",
    storageBucket: "hack-hex.appspot.com",
    messagingSenderId: "308901436514"
};                     
                     if (!firebase.apps.length) {
		    firebase.initializeApp(config);	
		    }                    		  		  		  
                    const messaging = firebase.messaging();
                    
                    messaging.requestPermission().then(function() {                                 
                    if(isTokenSentToServer()){
                    }else{
                        getRegToken();
                    }                                   
		 
                    }).catch(function(err) {
                    });
                
                function getRegToken(argument){
                     
                    messaging.getToken().then(function(currentToken) {
                      if (currentToken) {                      
                       saveToken(currentToken);
                        setTokenSentToServer(true);
                      } else {                                           
                        setTokenSentToServer(false);
                      }
                    }).catch(function(err) {                   
                      setTokenSentToServer(false);
                    });
                }
                function setTokenSentToServer(sent) {
                 window.localStorage.setItem('sentToServer', sent ? '1' : '0');
                }
                
                function isTokenSentToServer() {
                return window.localStorage.getItem('sentToServer') === '1';
                }
                
                function saveToken(currentToken){
                  var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                      if (this.readyState == 4 && this.status == 200) {
                      }
                    };
                    xhttp.open("POST", pwaforwp_obj.ajax_url+'?action=pwaforwp_store_token', true);
                    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhttp.send("token="+currentToken);
                }              
                 messaging.onMessage(function(payload) {
                 
                 notificationTitle = payload.data.title;
                    notificationOptions = {
                    body: payload.data.body,
                    icon: payload.data.icon
                    }
                    var notification = new Notification(notificationTitle, notificationOptions); 
                        notification.onclick = function(event) {
                        event.preventDefault();
                        window.open(payload.data.url, '_blank');
                        notification.close();
                        }
                });
