/* jQuery Content Rotator Plugin */
/* copyright: SiteOrganic 2010 */
/* coded by Matt Blasi */

(function ($) {
    $.fn.features = function (options) {

        var defaults = {
            name: 'features', // name for feature wrapper & for timer - NO SPACES

            autoplay: true, 		// to auto play rotation or not

            delay: 6000, 		// time between changing features

            fadeDelay: 500, 		// time fade during change features

            showPanel: false, 	// show the title.description panel
            panelLocation: 3, 		// 1=top, 2=right, 3=bottom, 4=left 
            panelOnHover: false, 	// show panel on hover ONLY

            showControls: false, 	// show prev.next controls
            showPlayBack: false, 	// show play.pause controls
            showPlayTxt: 'Play', 	// text string for play button
            showPauseTxt: 'Pause', 		// text string for pause button
            controlsOnHover: false, 	// show controls on hover ONLY

            thumbControl: false, 	// use.display thumbnails
            thumbLimit: 5, 		// limit thumbnails to this number
            thumbHover: false, 	// change on hover (defaults to change on click)
            thumbCreate: false, 	// have the script create the thumbnails
            thumbShowHover: false, 	// show thumbs on hover
            pauseOnHover: true,         // pause slideshow on hover, restart on mouse out

            addCount: false,        // adds list count of items

            addCountOf: false, 	// adds 1 of # count

            transition: 'fade', 	// transition type

            addMoreLink: false, 	// dynamically adds a more link, gets the url for the feature
            addMoreText: 'more', 	// text to display in link

            supportVideo: false, 	// support video in tag?

            tabControl: false, 	// create tabs using title		

            truncate: false, 	// truncate description		
            truncateLength: 100, 	// truncate character count		

            titleSplit: true, 		// split title string
            titleSplitCharacter: '/~/', // character at which to split the string

            ligxtbox_height: '450px',
            lightbox_width: '650px',
            lightbox_background: 'white',
            lightbox_padding: '5px'
        };

        var options = $.extend(defaults, options);

        return this.each(function () {

            //alert(window['timer-' + options.name]);

            obj = $(this);
            obj.addClass(options.name);

            var main = obj.find('ul:first').addClass('main ' + options.name);
            var feature = obj.find('.' + options.name + ' li');

            // Hides all features - Fade in first
            feature.css({ opacity: 0.0 }).addClass('feature').find('div').addClass('panel-overlay');
            feature.parent().find('li:first').addClass('shown').fadeTo(options.fadeDelay, 1.0, function () { if (options.panelOnHover == false) { descPanel('up'); } });
            main.find('li').find('div.panel-overlay').css({ 'top': main.outerHeight() });

            // Check if has image
            var imgCount = 0;
            feature.each(function () {
                var imgSource = $('.main li a').eq(imgCount).find('img').attr("src");
                if (imgSource != '') {
                    $('.main li a').eq(imgCount).parent().addClass('image');
                } else {
                    $('.main li a').eq(imgCount).find('img').css('display', 'none');
                }
                imgCount++;
            });

            featureCount = main.find('li:last').prevAll().length;
            if (featureCount == 0) {
                options.autoplay = false;
                options.showControls = false;
                options.showPlayBack = false;
                options.addCountOf = false;
            }

            resetAutoPlay = options.autoplay;

            // Activate Options
            if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
            if (options.truncate == true) { truncateText(); }
            if (options.tabControl == true) { controlsTabs(); }
            if (options.showControls == true) { controlsArrows(); }
            if (options.thumbCreate == true) { thumbnailCreate(); }
            var thumbs = obj.find('ul.thumbs');
            thumbs.css({ opacity: 0.0 });
            if (options.thumbControl == true) { controlsThumbs(); }
            if (options.thumbShowHover == true) { thumbnailShowOnHover(); }
            if (options.addCountOf == true) { controlsNumber(); }
            if (options.showPlayBack == true) { controlsPlay(); }
            if (options.addMoreLink == true) { addMoreLink(); }
            if (options.showPanel == true) { descPanelPosition(); }

            obj.mouseenter(function () {
                if (options.thumbShowHover == true) { thumbnailShowOnHoverMove('up'); }
            }).mouseleave(function () {
                if (options.thumbShowHover == true) { thumbnailShowOnHoverMove('down'); }
            });

            // PAUSE ON HOVER
            if(options.pauseOnHover){
            feature.mouseenter(function () {
               
                clearInterval(window['timer-' + options.name]);
                if (options.panelOnHover == true) { descPanel('up'); }
            }).mouseleave(function () {
              
                if (options.panelOnHover == true) { descPanel('down'); }
                if (options.showPlayBack == true) { if ($('.pbControl').hasClass('play')) { options.autoplay = false; } else { if (featureCount != 1) { options.autoplay = true; } } }
                if (options.autoplay == true) {
                    if (options.supportVideo == true) {
                        if (main.find('.shown').find('video').length) {
                            videoID = $('.feature.shown video').attr('id');
                            if (document.getElementById(videoID).paused) {
                                options.autoplay = true;
                            } else if (document.getElementById(videoID).ended) {
                                options.autoplay = true;
                            } else {
                                options.autoplay = false;
                                document.getElementById(videoID).addEventListener('ended', function () {
                                    options.autoplay = true;
                                    document.getElementById(videoID).currentTime = 0;
                                    document.getElementById(videoID).pause();
                                    window['timer-' + options.name] = setInterval(fnTransition, options.delay);
                                }, true);
                            }
                        } else if (main.find('.shown').find('object').length) {
                            videoID = $('.feature.shown object').attr('id');
                            $f().onStart(function () {
                                clearInterval(window['timer-' + options.name]);
                            });
                            $f().onFinish(function () {
                                window['timer-' + options.name] = setInterval(fnTransition, options.delay);
                            });
                        } else {
                            options.autoplay = true;
                            window['timer-' + options.name] = setInterval(fnTransition, options.delay);
                        }
                    } else {
                        window['timer-' + options.name] = setInterval(fnTransition, options.delay);
                    }
                }
            });
            }//endif pauseOnHover
            
            // ADD IN NUMBER COUNT
            if (options.addCount == true) {
                obj.find('.' + options.name).after('<ul class="count"></ul>');
                featureCounter = 0;
                $('.main.' + options.name + ' li').each(function () {
                    featureCounter++;
                    if($('.main.' + options.name + ' li').length>1)
                    $('ul.count').append('<li><a href="javascript:void(0);">' + featureCounter + '</a></li>');
                });
                $('ul.count li:first').addClass('shown');
                $('ul.count').find('li a').bind('click', function () {
                    if ($(this).parent().hasClass('shown')) {
                        return false;
                    } else {
                        if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                        newCount = $(this).parent().prevAll().length;
                        changeTransition(newCount);
                        changeControls();
                        if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                    }
                });

                if (options.addCount == true) { $('.count li:first'); }
            }

            // PRIMARY FUNCTIONT TO RUN TRANSITIONS
            function fnTransition() {
                changeTransition('next');
            }

            function changeTransition($next) {

                videoFeature = main.find('.shown').find('video').length;
                if (videoFeature == 1) { videoStop(); } else if (main.find('.shown').find('object').length) { videoStop(); }

                if (options.panelOnHover == false) { descPanel('down'); }

                countCurrent = main.find('li.shown').prevAll().length;
                countFull = main.find('li:last').prevAll().length;

                // get next & previous counts for eq()
                countPrev = main.find('li.shown').prev().prevAll().length;
                if (countCurrent == 0) { countPrev = countFull; }
                countNext = main.find('li.shown').next().prevAll().length;
                if (countCurrent == countFull) { countNext = 0; }

                // set eq() value
                if ($next == 'next') { eq = countNext; } else if ($next == 'prev') { eq = countPrev; } else { eq = parseInt($next); }

                if (options.transition == 'slide') {
                    // slide left right affect like in carousel
                    slideWidth = main.find('.shown').outerWidth();
                    slideCurrent = main.find('.shown');
                    slideNext = main.find('li').eq(eq);

                    slideCurrent.animate({
                        left: parseInt(slideCurrent.css('left'), 10) == 0 ?
					-slideCurrent.outerWidth() : 0
                    }).removeClass('shown');

                    slideNext.css({ opacity: 1.0}).css({ left: slideCurrent.outerWidth() + 'px' }).animate({
                        left: parseInt(slideNext.css('left'), 10) == 0 ? slideNext.outerWidth() : 0
                    }, function () {
                        if (options.panelOnHover == false) { descPanel('up'); }
                    }).addClass('shown');

                } else if (options.transition == 'slice') {
                    // slice effect like in nivo slider

                } else {
                    // standard fade effect
                    main.find('.shown').fadeTo(options.fadeDelay, 0.0).removeClass('shown');
                    main.find('li').eq(eq).stop().addClass('shown').fadeTo(options.fadeDelay, 1.0, function () { if (options.panelOnHover == false) { descPanel('up'); } });
                }

                if (main.find('.shown').find('video').length) { videoHTML5(); } else if (main.find('.shown').find('object').length) { videoFlash(); }

                changeControls();

            }
            // END CHANGE TRANSITIONS

            function changeControls() {

                eq = main.find('li.shown').prevAll().length;
                cf = main.find('li:last').prevAll().length;

                // Update controls & counter shown status
                if (options.addCountOf == true) {
                    $('.countOf .itemNumber').text(eq + 1);
                }

                if (options.addCount == true) {
                    $('.count li.shown').removeClass('shown');
                    $('.count li').eq(eq).addClass('shown');
                }

                if (options.tabControl == true) {
                    $('.tabs li.shown').removeClass('shown');
                    $('.tabs li').eq(eq).addClass('shown');
                }

                if (options.thumbControl == true) {
                    // get current series
                    thumbSeries = $('.thumbs li.shown').attr('class');
                    thumbSeries = thumbSeries.replace(' shown', '');
                    thumbSeries = thumbSeries.replace('shown ', '');

                    // get new series
                    newSeries = $('.thumbs li').eq(eq).attr('class');
                    newSeries = newSeries.replace(' shown', '');
                    newSeries = newSeries.replace('shown ', '');

                    // if new series show new hide old
                    if (newSeries != thumbSeries) {
                        $('.thumbs li.' + thumbSeries).fadeTo(options.fadeDelay, 0.0).css('display', 'none');
                        $('.thumbs li.' + newSeries).fadeTo(options.fadeDelay, 1.0).css('display', 'block');
                    }

                    //trasnition thumbs
                    $('.thumbs li.shown').removeClass('shown');
                    $('.thumbs li').eq(eq).addClass('shown');
                }


            } // END CHANGE CONTROLS

            function controlsTabs() {
                main.after('<ul class="tabs"></ul>');
                countTabs = 0;
                feature.each(function () {
                    tabName = $(this).find('.panel-overlay h2').text();
                    if (options.titleSplit == true) {
                        splitTest = tabName.search(options.titleSplitCharacter);
                        if (splitTest != -1) {
                            newTabs = tabName.split(options.titleSplitCharacter);
                            tabName = newTabs[0];
                            $(this).find('.panel-overlay h2').text(newTabs[1]);
                        }
                    }
                    if (tabName != '') {
                        $('ul.tabs').append('<li id="tab' + countTabs + '"><a href="javascript:void(0);" class="tabLink">' + tabName + '</a></li>');
                    }
                    countTabs++;
                });
                $('ul.tabs li:first').addClass('shown');
                $('a.tabLink').bind('click', function (event) {
                    event.preventDefault();
                    clearInterval(window['timer-' + options.name]);
                    if ($(this).parent().hasClass('shown')) {
                        return false;
                    } else {
                        tabClicked = $(this).parent().prevAll().length;
                        changeTransition(tabClicked);
                        changeControls();
                    }
                    if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                });
            } // END TAB CONTROLS

            function controlsArrows() {
                playCount = main.find('li:last').prevAll().length;
                var timer = options.name;

                if (playCount != 0) {
                    main.after('<div class="pnControl"><a class="prev" href="javascript:void(0);">Prev</a><a class="next" href="javascript:void(0);">Next</a></div>');

                    obj.find('.pnControl .next').bind('click', function (event) {
                        event.preventDefault();
                        if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                        changeTransition('next');
                        if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                    });
                    obj.find('.pnControl .prev').bind('click', function (event) {
                        event.preventDefault();
                        if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                        changeTransition('prev');
                        if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                    });

                }
                if (options.controlsOnHover == true) {
                    obj.find('.pnControl').fadeTo(0, 0.0);
                    obj.mouseenter(function () {
                        obj.find('.pnControl').fadeTo(100, 1.0);
                    }).mouseleave(function () {
                        obj.find('.pnControl').fadeTo(100, 0.0);
                    });
                }
            } // END CONTROLS ARROWS (PREV/NEXT)

            function controlsThumbs() {
                thumbs.fadeTo(options.fadeDelay, 1.0);
                $('.thumbs li:first').addClass('shown');
                if (options.thumbHover == false) {
                    thumbs.find('li a').bind('click', function () {
                        if ($(this).parent().hasClass('shown')) {
                            return false;
                        } else {
                            if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                            newThumb = $(this).parent().prevAll().length;
                            changeTransition(newThumb);
                            changeControls();
                            if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                        }
                    });
                } else {
                    thumbLinkCount = 0;
                    feature.each(function () {
                        thumbnailLink = feature.eq(thumbLinkCount).find('a').attr('href');
                        if (thumbnailLink != undefined) {
                            thumbs.find('li a').eq(thumbLinkCount).attr('href', thumbnailLink);
                        }
                        thumbLinkCount++;
                    });
                    thumbs.find('li a').mouseover(function () {
                        if (options.showPanel == true) { panel.css({ 'top': hideHeight }); }
                        if ($(this).parent().hasClass('shown')) {
                            return false;
                        } else {
                            if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                            newThumb = $(this).parent().prevAll().length;
                            changeTransition(newThumb);
                            changeControls();
                            if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                        }
                    });
                }
                thumbnailLimits();
            } // END CONTROLS THUMBNAILS

            function thumbnailLimits() {
                count = 0;
                series = 0;
                countTotal = $('.thumbs li:last').prevAll().length;
                $('.thumbs li').each(function () {
                    if (options.thumbLimit == count) {
                        series++;
                        count = 0;
                    }
                    $(this).addClass('series-' + series);
                    count++;
                });
                $('.thumbs li').css({ opacity: 0.0 });
                $('.thumbs li.series-0').css({ opacity: 1.0 });
                if (countTotal >= options.thumbLimit) {
                    $('.thumbs').after('<div class="thumbSeriesControls"><a class="prev" href="javascript:void(0);">&laquo;</a><a class="next" href="javascript:void(0);">&raquo;</a></div>');

                    obj.find('.thumbSeriesControls a').bind('click', function () {
                        clearInterval(window['timer-' + options.name]);
                        currentSeries = $('.thumbs li.shown').attr('class');
                        currentSeries = currentSeries.replace(' shown', '');
                        currentSeries = currentSeries.replace('shown ', '');
                        currentSeriesNum = parseInt(currentSeries.replace('series-', ''));
                        nextSeries = currentSeriesNum + 1;
                        if (currentSeriesNum != 0) {
                            prevSeries = currentSeriesNum - 1;
                        } else {
                            prevSeries = series;
                        }
                        $('.thumbs li.' + currentSeries).fadeTo(options.fadeDelay, 0.0).css('display', 'none');
                        newShown = parseInt(options.thumbLimit);
                        if ($(this).hasClass('prev')) {
                            $('.thumbs li.series-' + prevSeries).fadeTo(options.fadeDelay, 1.0).css('display', 'block');
                            newShown = newShown * prevSeries;
                        } else {
                            $('.thumbs li.series-' + nextSeries).fadeTo(options.fadeDelay, 1.0).css('display', 'block');
                            newShown = newShown * nextSeries;
                        }
                        changeTransition(newShown);
                    });
                }
            } // END LIMIT THUMBNAILS

            function thumbnailCreate() {
                main.after('<ul class="thumbs"></ul>');
                countTumbs = 0;
                feature.each(function () {
                    thumbImage = $(this).find('img').attr('src');
                    if (thumbImage != '') {
                        $('ul.thumbs').append('<li><a href="javascript:void(0);"><img src="' + thumbImage + '" /></a></li>');
                    }
                    countTumbs++;
                });
            }

            function thumbnailShowOnHover() {
                featureHeight = obj.outerHeight();
                thumbHeight = obj.find('ul.thumbs').outerHeight();
                obj.css('overflow', 'hidden');
                obj.find('ul.thumbs').css({
                    'position': 'absolute',
                    'top': '0px'
                });
            }

            function thumbnailShowOnHoverMove(direction) {
                featureHeight = obj.outerHeight();
                thumbHeight = obj.find('ul.thumbs').outerHeight();
                if (direction == 'up') { obj.find('ul.thumbs').animate({ 'top': '-=' + thumbHeight }, 500); }
                if (direction == 'down') { obj.find('ul.thumbs').animate({ 'top': '+=' + thumbHeight }, 500); }
            }


            function controlsNumber() {
                

                main.after('<div class="countOf"></div>');
                featureCounter = 0;
                $('.countOf').append('<span class="itemNumber">1</span> of ');
                $('.main.' + options.name + ' li').each(function () {
                    featureCounter++;
                });
                $('.countOf').append('<span class="totalNumber">' + featureCounter + '</span>');
            } // END CONTROLS NUMBERS

            function controlsPlay() {
                var playButtonTxt = options.showPauseTxt;
                var play = options.showPlayTxt;
                var pause = options.showPauseTxt;
                var timer = options.name;
                main.after('<a href="#" class="pbControl pause">' + playButtonTxt + '</a>');
                $('.pbControl').bind('click', function (event) {
                    event.preventDefault();
                    if (playButtonTxt == pause) {
                        if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                        $('.pbControl').removeClass('pause').addClass('play');
                        playButtonTxt = play;
                    } else {
                        if (options.autoplay == true) { window['timer-' + options.name] = setInterval(fnTransition, options.delay); }
                        $('.pbControl').removeClass('play').addClass('pause');
                        playButtonTxt = pause;
                    }
                    $('.pbControl').text(playButtonTxt);
                });
                $('video').bind('play', function(){
                    console.log('playing...');
      if (options.autoplay == true) { clearInterval(window['timer-' + options.name]); }
                        $('.pbControl').removeClass('pause').addClass('play');
                        playButtonTxt = play;
                    });
            } // END CONTROLS PLAY/PAUSE BUTTON

            function descPanelPosition() {
                panel = main.find('li div');
                featureHeight = obj.outerHeight();
                featureWidth = obj.outerWidth();
                panelHeight = panel.outerHeight();
                panelWidth = panel.outerWidth();

                switch (options.panelLocation) {
                    case 1: //top
                        panel.css({ 'top': '-' + panelHeight + 'px', 'left': '0px', 'width': '100%' });
                        break;
                    case 2: //right
                        panelWidth = featureWidth / 3;
                        panel.css({ 'top': '0px', 'right': '-' + panelWidth + 'px', 'width': panelWidth + 'px', 'height': '100%' });
                        break;
                    case 3: //bottom
                        panel.css({ 'top': featureHeight + 'px', 'left': '0px', 'width': '100%' });
                        break;
                    case 4: //left
                        panelWidth = featureWidth / 3;
                        panel.css({ 'top': '0px', 'left': '-' + panelWidth + 'px', 'width': panelHeight + 'px', 'height': '100%' });
                        break;
                }
            } // END DESCRIPTION PANEL POSITION

            function descPanel(direction) {
                panel = main.find('li.shown div');

                //featureHeight = obj.outerHeight();
                //featureWidth  = obj.outerWidth();
                featureHeight = main.outerHeight();
                featureWidth = main.outerWidth();
                panelHeight = panel.outerHeight();
                panelWidth = panel.outerWidth();

                if (options.showPanel == true) {
                    switch (options.panelLocation) {
                        case 1:
                            if (direction == 'up') {
                                panel.css({ 'top': '-' + panelHeight + 'px' });
                                panel.stop(true, true).animate({ 'top': '+=' + panelHeight + 'px' }, 500);
                            } else {
                                panel.stop(true, true).animate({ 'top': '-=' + panelHeight + 'px' }, 500);
                            }
                            break;
                        case 2:
                            if (direction == 'up') {
                                panel.css({ 'right': '-' + panelWidth + 'px' });
                                panel.stop(true, true).animate({ 'right': '+=' + panelWidth + 'px' }, 500);
                            } else {
                                panel.stop(true, true).animate({ 'right': '-=' + panelWidth + 'px' }, 500);
                            }
                            break;
                        case 4:
                            if (direction == 'up') {
                                panel.css({ 'left': '-' + panelWidth + 'px' });
                                panel.stop(true, true).animate({ 'left': '+=' + panelWidth + 'px' }, 500);
                            } else {
                                panel.stop(true, true).animate({ 'left': '-=' + panelWidth + 'px' }, 500);
                            }
                            break;
                        default:
                            if (direction == 'up') {
                                panel.css({ 'top': featureHeight + 'px' });
                                panel.stop(true, true).animate({ 'top': '-=' + panelHeight + 'px' }, 500);
                            } else {
                                panel.stop(true, true).animate({ 'top': '+=' + panelHeight + 'px' }, 500);
                            }
                            break;
                    }
                }
            } // END DESCIPTION PANEL SLIDE

            function addMoreLink() {
                featureCount = 0;
                feature.each(function () {
                    var moreLinkURL = $(this).find('a').attr('href');
                    if (moreLinkURL) {
                        $(this).append('<a href="' + moreLinkURL + '" class="more-link">' + options.addMoreText + '</a>');
                    }
                    featureCount++;
                });
            } // END ADD MORE LINK

            function truncateText() {
                feature.each(function () {
                    var panelText = $('.panel-overlay p').html();

                    if (panelText.length > options.truncateLength) {
                        var splitLocation = panelText.indexOf(' ', options.truncateLength);
                        if (splitLocation != -1) {
                            var splitLocation = panelText.indexOf(' ', options.truncateLength);
                            var str1 = panelText.substring(0, splitLocation);
                            $('.panel-overlay p').html(str1 + '<span>&hellip;</span>');
                        }
                    }
                });
            } // END TRUNCATE TEXT

            // if (options.supportVideo == true) {

            //     featureCount = 0;
            //     videoCount = 0;

            //     feature.each(function () {
            //         if (feature.eq(featureCount).find('img').length) { feature.eq(featureCount).addClass('image'); } else { feature.eq(featureCount).addClass('video').removeClass('image').find('a').attr('href', ''); }
                 
            //         if (feature.eq(featureCount).find('video').length) {

            //         videoHeight =  feature.eq(featureCount).find('video').height() * (feature.width()/ feature.eq(featureCount).find('video').width());
            //         videoWidth = feature.width();
            //         feature.eq(featureCount).height(videoHeight);

            //             feature.eq(featureCount).find('video').attr({ height: videoHeight, width: videoWidth });
            //             feature.eq(featureCount).find('video').attr('id', 'video-' + featureCount);
            //         } else {
            //             if(feature.eq(featureCount).find('object').length){
            //               videoHeight =  feature.eq(featureCount).find('object').height() * (feature.width()/ feature.eq(featureCount).find('object').width());
            //         videoWidth = feature.width();
            //         feature.eq(featureCount).height(videoHeight);
            //             feature.eq(featureCount).find('object').attr({ height: videoHeight, width: videoWidth });
            //             feature.eq(featureCount).find('object').parent().attr('id', 'video-' + featureCount);
            //         }
            //         }
            //         featureCount++;
            //     });

            // } // END VIDEO SUPPORT DETECTION
  if (options.supportVideo == true) {

                featureCount = 0;
                videoCount = 0;

                feature.each(function () {
                    if (feature.eq(featureCount).find('img').length) { feature.eq(featureCount).addClass('image'); } else { feature.eq(featureCount).addClass('video').removeClass('image').find('a').attr('href', ''); }
                    videoHeight = feature.height();
                    videoWidth = feature.width();
                    if (feature.eq(featureCount).find('video').length) {
                        feature.eq(featureCount).find('video').attr({ height: videoHeight, width: videoWidth });
                        feature.eq(featureCount).find('video').attr('id', 'video-' + featureCount);
                    } else {
                        feature.eq(featureCount).find('object').attr({ height: videoHeight, width: videoWidth });
                        feature.eq(featureCount).find('object').parent().attr('id', 'video-' + featureCount);
                    }
                    featureCount++;
                });

            } // END VIDEO SUPPORT DETECTION

            // functions not yet used are to be used for any additional effects or listeners on the videos.
            function videoHTML5() {
            }

            function videoFlash() {
            }

            function videoStop() {
                if ($('.feature.shown video').length) {
                    videoID = $('.feature.shown video').attr('id');
                    document.getElementById(videoID).pause();
                } else {
                    // commented out because erring with google's script - function is a base function for flowplayer
                    // $f("*").each(function() {  this.stop(); });  			
                }
                if (resetAutoPlay == true) { return options.autoplay = true; }
            }

        });

    }; //END
})(jQuery);
