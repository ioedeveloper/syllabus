export let CONFIG = { //PLEASE UPDATE THE FOLLOWING VALUES WITH YOURS ONES
    appVersion: "Quizionic 3.3.0",
    defaultUserName: "StudioMob",
    analyticsiOS: "UA-63761768-4",
    analyticsAndroid: "UA-63761768-5",
    adMobAndroidbanner: 'ca-app-pub-3709095601931870/3837206546', 
    adMobAndroidinterstitial: 'ca-app-pub-3709095601931870/8267406146',
    adMobAndroidRewardvideo: '', //requires cordova-admob-mediation installation
    adMobiOSbanner: 'ca-app-pub-3709095601931870/7754515340', 
    adMobiOSinterstitial: 'ca-app-pub-3709095601931870/9231248541',
    adMobiOSdRewardvideo: '', //requires cordova-admob-mediation installation
    androidApplicationLicenseKey : "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmWH457G1QwuL2oTZ1kdnGeBPL7hffbQg3Sdav1fmT8N0zmeXAfFUVsR57hw0MoDTq/Z1eHkChZzcz+Xj79xVKh1rNaBv1fYqT0D0JK3i8oCCGIBPj9lBgksOX55XwCm1hTmgWyVeFxAHpoX2rtMFC9+5nAo63emkXmvfO/PDFQ3r+YUlnZiX4xJTvo+SzBigwSL3XJvQdzyVS8cxIDM3Jf93Wl6XR7PD14WcWa9OXa5uY8Hn0zamIY7H0/V9d0te1c9IPO6CVi52X6fk0kFvNmgAEfWSLS2EOhVZSOoQN/p+QZNroFaO78URl5JoZLWCm3VjCXCA7FASqHjMidVXvwIDAQAB",
    productIds : ["quiz3_exam_x3","quiz3_exam_x1","quiz3_expla_x5","quiz3_expla_x10","quiz3_expla_x50","quiz3_f_version","quiz3_no_ads"],
    productType : ["non_consumable","non_consumable","consumable","consumable","consumable","non_consumable","non_consumable"],
    fullVersionProductID: "quiz3_f_version",
    noAdsProductID: "quiz3_no_ads",
    examX1ProductID: "quiz3_exam_x1",
    examX3ProductID: "quiz3_exam_x3",
    explaX5ProductID: 'quiz3_expla_x5',
    explaX10ProductID: 'quiz3_expla_x10',
    explaX50ProductID: 'quiz3_expla_x50',
    //requestUpdateURL: "/updateDB",
    requestUpdateURL: "http://www.studiomob.ca/pin/requestUpdate.php",
    //requestUpdateURL: "/updateNewDB",
    requestUpdateNewURL: "http://www.studiomob.ca/pin/requestUpdateNew.php",
    //requestPinURL: "/requestPIN",
    requestPinURL: "http://www.studiomob.ca/pin/requestPIN.php",
    //reportProgressURL: "updateProgress",
    reportProgressURL: "http://www.studiomob.ca/pin/reportProgress.php",
    delayForNextQuestion: 1000, // in mileseconds
    delayForStartingExam: 2500, // in mileseconds
    QDB_NAME: 'Q3data.db',
    PDB_NAME: 'Q3progress.db',
    GAUserID: 'Quizionic'
};