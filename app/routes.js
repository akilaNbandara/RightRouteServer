var RouteController = require('./controllers/routes'),  
    StationController = require('./controllers/stations'),
    AuthenticationController=require('./controllers/authentication'),  
    express = require('express');
    passportService = require('../config/passport'),
    passport = require('passport');

 var requireAuth = passport.authenticate('jwt', {session: false}),
     requireLogin = passport.authenticate('local', {session: false});

module.exports= function(app){
	 var apiRoutes = express.Router(),
        stationRoutes = express.Router(),
        pathRoutes = express.Router();
        authRoutes= express.Router();


    // code here

    apiRoutes.use('/auth', authRoutes);
 
    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);
    /* is restricted by using requireAuth. What this will allow
 	us to do is check if a user is authenticated (using their JWT) by hitting this URL. */
     authRoutes.get('/protected', requireAuth, function(req, res){
        res.send({ content: 'Success'});
    });

    stationRoutes.post('/stationtest',StationController.typeaheadStations); //typeahaed
    // only admin can add stations 
    stationRoutes.post('/station',requireAuth,AuthenticationController.roleAuthorization(['admin']),
    	StationController.addStation); 
    stationRoutes.get('/stations/:station_id',StationController.getStation);// get a single station :D
    stationRoutes.get('/stations',StationController.getStations);
    stationRoutes.get('/station/:station_name',StationController.getStationByName);

    pathRoutes.get('/routes',RouteController.getRoutes);
    pathRoutes.post('/routes',RouteController.getRoute);
    pathRoutes.post('/bus_routes',RouteController.getPath); // return connected or directed bus routes :D
    // dont need to recieve all the reviews here : make it change :D

    pathRoutes.post('/reviews',requireAuth,AuthenticationController.roleAuthorization(['normal','admin']),
    	RouteController.addReview);
    pathRoutes.get('/reviews/:route_no',RouteController.getReviews); 
    // this one should be updated to return as chunks stop load all reviews as once

    //should be upgraded.A user should only delete his review
    pathRoutes.put('/reviews/:route_no/:review_id',AuthenticationController.roleAuthorization(['normal','admin']),
        RouteController.deleteReview);
    pathRoutes.post('/routeList',RouteController.typeaheadRoutes);
    
    app.use('/api',stationRoutes);
    app.use('/api',pathRoutes);
    app.use('/api',apiRoutes);  
}