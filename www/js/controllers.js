angular.module('conFusion.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $ionicPopover,
$localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    $scope.reservation = {};
    $scope.registration = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form

    $ionicModal.fromTemplateUrl('templates/reserve.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.reserveform = modal;
    });

    $scope.closeReserve = function () {
        $scope.reserveform.hide();
    };

    $scope.reserve = function () {
        $scope.reserveform.show();
    };

    $scope.doReserve = function () {
        console.log('Doing reservation', $scope.reservation);
        $timeout(function () {
            $scope.closeReserve();
        }, 1000);
    };


    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.registerform = modal;
    });

    $scope.closeRegister = function () {
        $scope.registerform.hide();
    };

    $scope.register = function () {
        $scope.registerform.show();
    };

    $ionicPlatform.ready( function () {
        var options = {
            maximumImagesCount: 1,
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            width: 100,
            targetWidth: 100,
            height: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $scope.takePicture = function() {
            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
            }, function (err) {
                console.log(err);
            });
            $scope.registerform.show();
        };

        $scope.choosePicture = function () {
            $cordovaImagePicker.getPictures(options)
            .then(function (results) {
                    $scope.registration.imgSrc =  results[0];
            }, function(error) {
                console.log(error);
            });
            $scope.registerform.show();
        };
    });

})

.controller('MenuController', ['$scope', 'dishes', 'favoriteFactory', 'baseURL',
'$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
function ($scope, dishes, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform,
$cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showMenu = false;
    $scope.message = "Loading...";

    $scope.dishes = dishes;

    $scope.select = function (setTab) {
        $scope.tab = setTab;
        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function () {
        $scope.showDetails = !$scope.showDetails;
    };

    $scope.addFavorite = function (index) {
        console.log("index is "+ index);

        favoriteFactory.addToFavorites(index);
        $ionicListDelegate.closeOptionButtons();

        $ionicPlatform.ready(function () {
            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Added Favorite",
                text: $scope.dishes[index].name
            }).then(function () {
                console.log('Added Favorite' + $scope.dishes[index].name);
            },
            function () {
                console.log('Failed to add Favorite');
            });

            $cordovaToast
                .show('Added Favorite '+$scope.dishes[index].name, 'long', 'center')
                .then(function (success) {
                    console.log('Added Favorite' + $scope.dishes[index].name);
                }, function (error) {
                    console.log('Failed to add Favorite');
                });
        });
    };
}])

.controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    $scope.sendFeedback = function () {


        if ($scope.feedback.agree && ($scope.feedback.mychannel === "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
        }
    };
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {
    feedbackFactory.getFeedback().query(
        function (response) {
            $scope.feedbacks = response;
        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.sendFeedback = function () {
        console.log($scope.feedback);

        if ($scope.feedback.agree && ($scope.feedback.mychannel === "") && !$scope.feedback.mychannel) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        } else {

            $scope.invalidChannelSelection = false;
            $scope.feedback.mychannel = "";
            feedbackFactory.getFeedback().save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedbackForm.$setPristine();
            console.log($scope.feedback);
        }
    };
}])

.controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory',
'baseURL', '$ionicPopover', '$ionicModal','favoriteFactory', '$ionicPlatform',
'$cordovaLocalNotification', '$cordovaToast',function ($scope, $stateParams, dish,
menuFactory, baseURL,$ionicPopover, $ionicModal, favoriteFactory, $ionicPlatform,
$cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;

    $scope.dish = menuFactory.get({
            id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $scope.dish = response;
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );

    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function() {
        $scope.popover.hide();
    };

    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.addToFavorites = function () {
        favoriteFactory.addToFavorites($scope.dish.id);
        $scope.closePopover();
        $cordovaLocalNotification.schedule({
            id: 1,
            title: "Added Favorite",
            text: $scope.dish.name
        }).then(function () {
            console.log('Added Favorite' + $scope.dish.name);
        },
        function () {
            console.log('Failed to add Favorite');
        });

        $cordovaToast
            .show('Added Favorite '+$scope.dish.name, 'long', 'bottom')
            .then(function (success) {
                console.log('Added Favorite' + $scope.dish.name);
            }, function (error) {
                console.log('Failed to add Favorite');
            });
    };

    $scope.openAddComment = function() {
      $scope.modal.show();
    };
    $scope.closeAddComment = function() {
      $scope.modal.hide();
    };

    $scope.showDish = false;
    $scope.message = "Loading...";

    $scope.sort = "";

}])

.controller('DishCommentController', ['$scope', 'menuFactory', function ($scope, menuFactory) {
    $scope.comment = {
        author: "",
        rating: 5,
        comment: "",
        date: ""
    };

    $scope.submitCommentMobile = function () {
        $scope.comment.date = new Date().toISOString();
        $scope.dish.comments.push($scope.comment);
        menuFactory.update({
            id: $scope.dish.id
        }, $scope.dish);
        $scope.comment = {};
        $scope.closePopover();
        $scope.closeAddComment();
    };

    $scope.submitComment = function () {

        $scope.comment.date = new Date().toISOString();

        $scope.dish.comments.push($scope.comment);

        menuFactory.update({
            id: $scope.dish.id
        }, $scope.dish);

        $scope.commentForm.$setPristine();

        $scope.comment = {
            name: "",
            rating: 5,
            comment: "",
            commentDate: ""
        };
    };
}])

.controller('IndexController', ['$scope', 'menuFactory','promotionFactory', 'corporateFactory','baseURL', '$http',function ($scope,
 menuFactory, promotionFactory, corporateFactory, baseURL, $http) {
    $scope.baseURL = baseURL;
    $scope.showDish = false;
    $scope.message = "Loading...";
    $scope.dish = menuFactory.query({
            featured: "true"
        })
        .$promise.then(
            function (response) {
                var dishes = response;
                $scope.dish = dishes[0];
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    var promotions = promotionFactory.query({
        featured: "true"
    })
    .$promise.then(
            function (response) {
                var promotions = response;
                $scope.promotion = promotions[0];
                $scope.showPromotion = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );
    var leaders = corporateFactory.query({
            featured: "true"
        })
        .$promise.then(
            function (response) {
                var leaders = response;
                $scope.leader = leaders[0];
                $scope.showLeader = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
        );

    $scope.doRefresh = function() {
        $http.get('/templates/home.html')
        .success(function() {
            $scope.featuredDish = featuredDish;
            $scope.featuredPromotion = featuredPromotion;
            $scope.featuredChef = featuredChef;
            console.log("Refresh done.");
        })
        .finally(function() {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
}])

.controller('AboutController', ['$scope', 'corporateFactory', 'baseURL',
function ($scope, corporateFactory, baseURL) {
    $scope.baseURL = baseURL;
    $scope.leaders = corporateFactory.query();
}])

.controller('FavoriteController', ['$scope', 'dishes', 'favorites','favoriteFactory',
'baseURL', '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$cordovaVibration',
function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate,
$ionicPopup, $ionicLoading, $timeout, $cordovaVibration) {
    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $scope.favorites = favorites;

    $scope.dishes = dishes;

    console.log($scope.dishes,$scope.favorites);

    $scope.toggleDelete = function () {
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
    };

    $scope.deleteFavorite = function (index) {

        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Delete',
            template: 'Are you sure you want to delete this item?'
        });

        confirmPopup.then(function (res) {
            if (res) {
                console.log('Ok to delete');
                favoriteFactory.deleteFromFavorites(index);
                $cordovaVibration.vibrate(100);
            } else {
                console.log('Canceled delete');
            }
        });

        $scope.shouldShowDelete = false;

        };

}])

.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {

    $scope.loginData = $localStorage.getObject('userinfo','{}');

    $scope.doLogin = function () {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);
        scope.closeLogin();
    };

}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {

    $scope.register={};
    $scope.loginData={};

    $scope.doRegister = function () {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);

        scope.closeRegister();
    };
}])

.filter('favoriteFilter', function () {

    return function(dishes, favorites) {
        var out = [];

        for (var i=0; i<favorites.length; i++){
            for (var j=0; j<dishes.length; j++){
                if (dishes[j].id === favorites[i].id)
                    out.push(dishes[j]);
            }
        }
        return out;
    };

})
;
