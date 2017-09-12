'use strict';

var works = [
    'img/works/work_0.png',
    'img/works/work_1.png',
    'img/works/work_2.png',
    'img/works/work_3.png',
    'img/works/work_4.png',
    'img/works/work_5.png',
    'img/works/work_6.png'
];

var settings = {
    scrollMultipliers: {

        mobile: {
            backdrop: 0.5, // in screen heights
            indexTitleOffset: 0.4, // relative to normal scroll

            textCenter: 0.6, // at which screen text should be centered
            imageCenter: 1.2, // at which screen image should be centered
            contentOffset: 2, // how deep content is padded

            textAdditionalOffset: 0, // screen heights
            imageAdditionalOffset: 0.3, // screen heights
        },
        wide: {
            backdrop: 0.5, // in screen heights
            indexTitleOffset: 0.3, // relative to normal scroll

            textCenter: 3, // at which screen text should be centered
            imageCenter: 3, // at which screen image should be centered
            contentOffset: 4, // how deep content is padded

            textAdditionalOffset: 0, // screen heights
            imageAdditionalOffset: 0.005, // screen heights
        },

        opacityChangeTreshold: 20, // percents of the moved distance

        backdropLower: 1 // in screen heights
    },

    scrollingTextSpeed: [ // time in seconds to move from right to left
        {'0': 3},
        {'768': 3.5},
        {'960': 4},
        {'1024': 6},
        {'1440': 8}
    ],
    scrollingTextGap: 0, // scrolling text gap size in screen widths

    blockPadding: 0.33, // in screen heights

    moveDeltaTreshold: 500, // total x+y delta
    mobileMaxWidth: 960,
    mobileMinWidth: 768
};


var load = function() {
    var html = document.documentElement;
    var loading = document.querySelector('.loading');
    var indexTitleText = document.querySelector('.index-title-text');

    var page = document.querySelector('.page');

    var indexTitle = document.querySelector('.index-title');
    var backdrop = document.querySelector('.backdrop');
    var aboutLeft = document.querySelector('.about-left');
    var aboutRight = document.querySelector('.about-right');

    var aboutTextContainer = document.querySelector('.about-text-container');
    var aboutImageContainer = document.querySelector('.about-image-container');

    var content = document.querySelector('.content');
    var contentUpper = document.querySelector('.content-upper');
    var contentLower = document.querySelector('.content-lower');
    var contentBlocks  = document.querySelectorAll('.content-padded-block');
    var contentFollow  = document.querySelector('.content-follow');

    var footer = document.querySelector('.footer');
    var footerLinks = {
        leftLower: document.querySelector('.footer-left .footer-link-lower'),
        leftUpper: null,
        rightLower: document.querySelector('.footer-right .footer-link-lower'),
        rightUpper: document.querySelector('.footer-right .footer-link-upper')
    };

    var partnersHover = document.querySelector('.content-partners-hover');
    var partnersImages = document.querySelector('.content-partners-images');

    var mobile = function() {
        return html.clientWidth < settings.mobileMaxWidth;
    };
    var mobileMin = function() {
        return html.clientWidth < settings.mobileMinWidth;
    };


    // blocks

    var contentOffset = 0;

    var resizeBlocks = function() {
        Array.prototype.forEach.call(contentBlocks, function(el) {
            el.style.paddingTop = html.clientHeight * settings.blockPadding + 'px';
            el.style.paddingBottom = html.clientHeight * settings.blockPadding + 'px';
        });
        contentOffset = html.clientHeight * settings.scrollMultipliers[mobile() ? 'mobile' : 'wide'].contentOffset;
        content.style.marginTop = contentOffset + 'px';
        contentUpper.style.paddingBottom = html.clientHeight * settings.blockPadding + 'px';
    };
    resizeBlocks();

    window.addEventListener('resize', resizeBlocks);


    // title and scrolling text

    var showTitle = function() {
        loading.classList.add('done');

        var scrollTimeout = null;
        var scrollAmount;
        var scrollDuration;
        var started = false;

        var getSpeed = function() {
            var speed;

            settings.scrollingTextSpeed.forEach(function(el) {
                var key = Object.keys(el)[0];
                if (html.clientWidth >= parseInt(key)) {
                    speed = el[key];
                }
            });

            return 1 / speed;
        };

        var setupScroll = function() {
            scrollAmount = indexTitleText.clientWidth + html.clientWidth * (1 + settings.scrollingTextGap); // + screen width + initial 100% offset + portion of the screen width
            scrollDuration = scrollAmount / (html.clientWidth * getSpeed());
            indexTitleText.style.transitionDuration = scrollDuration + 's';
        };
        setupScroll();

        var resetPosition = function() {
            indexTitleText.classList.add('no-transition');
            indexTitleText.style.transform = 'translate3d(0, 0, 0)';
            indexTitleText.clientWidth; // redrawing
            indexTitleText.classList.remove('no-transition');
        };

        var lastWidth = html.clientWidth;

        var updateScroll = function() {
            var widthChanged = html.clientWidth !== lastWidth;
            if (!widthChanged) {
                return;
            }
            lastWidth = html.clientWidth;

            clearTimeout(scrollTimeout);
            setupScroll();
            resetPosition();
            if (started) {
                startScrolling();
            }
        };
        window.addEventListener('resize', updateScroll);

        var startScrolling = function() {
            indexTitleText.style.transform = 'translate3d(' + -scrollAmount + 'px, 0, 0)';

            scrollTimeout = setTimeout(function() {
                resetPosition();
                startScrolling();
            }, scrollDuration * 1000);
        };

        backdrop.classList.add('active');

        var showFooter = function() {
            footer.classList.add('active');
            document.body.classList.remove('locked');
            backdrop.style.display = 'none';
            page.style.background = 'rgba(0, 0, 0, ' + 1  + ')';
            setTimeout(function() {
                startScrolling();
                started = true;
            }, 1000);
        };

        setTimeout(showFooter, 1000);
    };

    setTimeout(showTitle, 1000);


    // about image

    var aboutImage = document.querySelector('.about-image');
    var aboutCaption = document.querySelector('.about-caption');
    var imageRatio = aboutImage.naturalWidth / aboutImage.naturalHeight;

    var resizeImage = function() {
        aboutImage.style.width = (html.clientHeight - aboutCaption.clientHeight) * imageRatio + 'px';
    };

    resizeImage();
    window.addEventListener('resize', resizeImage);


    // scrolling

    var initScrolling = function() {

        var getBackdropOpacity = function(scroll, ignoreLower) {
            var opacity = 1 - scroll * (1 / (html.clientHeight * settings.scrollMultipliers[mobile() ? 'mobile' : 'wide'].backdrop));
            console.log(opacity, ignoreLower)
            if (opacity < 0) {
                if (ignoreLower) {
                    opacity = 0;
                } else {
                    var scrollLower = scroll - contentLower.offsetTop - contentOffset + html.clientHeight;
                    opacity = scrollLower / (html.clientHeight * settings.scrollMultipliers.backdropLower);
                    if (opacity > 1) {
                        opacity = 1;
                    } else if (opacity < 0) {
                        opacity = 0;
                    }
                }
            } else if (opacity > 1) {
                opacity = 1;
            }
            return opacity;
        };

        var getIndexTitleOffset = function(scroll) {
            var offset = -scroll * settings.scrollMultipliers[mobile() ? 'mobile' : 'wide'].indexTitleOffset;
            return offset;
        };

        var getAboutStyle = function(scroll) {

            var screen = mobile() ? 'mobile' : 'wide';

            var finishingScrollPointText = settings.scrollMultipliers[screen].textCenter * 2 * html.clientHeight;
            var maxOffsetText = (html.clientHeight + aboutTextContainer.clientHeight) / 2;
            var offsetText = (maxOffsetText * 2) - scroll / (finishingScrollPointText / (maxOffsetText * 2)) - maxOffsetText;
            var offsetTextCorrected = offsetText + settings.scrollMultipliers[screen].textAdditionalOffset * html.clientHeight;

            var offsetTextMultiplier = Math.abs(offsetTextCorrected / maxOffsetText);
            var offsetTextMin = 1 - settings.scrollMultipliers.opacityChangeTreshold / 100; // 0.8
            var offsetTextRange = Math.min(1, Math.max(offsetTextMin, offsetTextMultiplier)); // 0.8 -- 1
            var opacityText = 1 - (offsetTextRange - offsetTextMin) * (1 / (1 - offsetTextMin));


            var finishingScrollPointImage = settings.scrollMultipliers[screen].imageCenter * 2 * html.clientHeight;
            var maxOffsetImage = (html.clientHeight + aboutImageContainer.clientHeight) / 2;
            var offsetImage = (maxOffsetImage * 2) - scroll / (finishingScrollPointImage / (maxOffsetImage * 2)) - maxOffsetImage;
            var offsetImageCorrected = offsetImage + settings.scrollMultipliers[screen].imageAdditionalOffset * html.clientHeight;

            var offsetImageMultiplier = Math.abs(offsetImageCorrected / maxOffsetImage);
            // var offsetImageMultiplier = -offsetImageCorrected / maxOffsetImage;
            var offsetImageMin = 1 - settings.scrollMultipliers.opacityChangeTreshold / 100; // 0.8
            var offsetImageRange = Math.min(1, Math.max(offsetImageMin, offsetImageMultiplier)); // 0.8 -- 1
            var opacityImage = 1 - (offsetImageRange - offsetImageMin) * (1 / (1 - offsetImageMin));

            return {
                text: {
                    position: offsetTextCorrected,
                    opacity: opacityText
                },
                image: {
                    position: offsetImageCorrected,
                    opacity: opacityImage
                }
            };
        };

        var firstScroll = true;

        var handleScroll = function() {
            var scroll = window.scrollY;

            var opacity = getBackdropOpacity(scroll);
            var opacityWithoutLower = getBackdropOpacity(scroll, true);

            if (!firstScroll) {
                page.style.background = 'rgba(0, 0, 0, ' + opacity  + ')';
                // backdrop.style.display = 'none';
            }
            firstScroll = false;

            footerLinks.leftLower.style.opacity = opacityWithoutLower;
            footerLinks.leftLower.style.visibility = opacityWithoutLower === 0 ? 'hidden' : 'visible';

            footerLinks.rightLower.style.opacity = opacity;
            footerLinks.rightLower.style.visibility = opacity === 0 ? 'hidden' : 'visible';

            if (mobileMin()) {
                var preTriggerPoint = scroll - contentLower.offsetTop - contentOffset + html.clientHeight;

                if (preTriggerPoint > 0) {
                    var triggerPoint = contentFollow.offsetTop + contentOffset + settings.blockPadding * html.clientHeight;
                    var triggerPointStop = contentFollow.offsetTop + contentOffset + contentFollow.clientHeight;
                    var scrollPastTrigger = scroll + html.clientHeight - triggerPoint;

                    var linkOffset;

                    if (scrollPastTrigger > 0) {
                        linkOffset = 130 - scrollPastTrigger / ((triggerPointStop - triggerPoint) / 130);
                    } else {
                        linkOffset = 130;
                    }

                } else {
                    linkOffset = 0;
                }
                footerLinks.rightLower.style.transform = 'translate3d(0, ' + linkOffset + '%, 0)';
            }

            if (!mobileMin()) {
                footerLinks.rightUpper.style.opacity = 1 - opacity;
                footerLinks.rightUpper.style.visibility = opacity === 1 ? 'hidden' : 'visible';
            }

            // if (opacity === 0) {
                // var cs = window.getComputedStyle(indexTitleText);
                // var xOffset = cs.transform.replace(/[^\d,.-]/g, '').split(',')[4];
                // console.log(xOffset);
            // }

            indexTitle.style.transform = 'translate3d(0, ' + getIndexTitleOffset(scroll) + 'px, 0)';

            var aboutStyle = getAboutStyle(scroll);

            aboutTextContainer.style.transform = 'translate3d(0, ' + aboutStyle.text.position + 'px, 0)';
            aboutTextContainer.style.opacity = aboutStyle.text.opacity;
            aboutImageContainer.style.transform = 'translate3d(0, ' + aboutStyle.image.position + 'px, 0)';
            aboutImageContainer.style.opacity = aboutStyle.image.opacity;
        };


        document.addEventListener('scroll', handleScroll);
        handleScroll();
    };

    initScrolling();


    // partners

    var startX = null;
    var startY = null;

    var worksCounter = 0;

    var handleMove = function(e) {

        if (startX === null || startY === null) {
            startX = e.pageX;
            startY = e.pageY;
        };
        var xDelta = Math.abs(e.pageX - startX);
        var yDelta = Math.abs(e.pageY - startY);

        var xElement = e.pageX - partnersHover.offsetLeft;
        var yElement = e.pageY - partnersHover.offsetTop - contentOffset;

        if (xElement < 0 || xElement > partnersHover.clientWidth || yElement < 0 || yElement > partnersHover.clientHeight) {
            return;
        }

        if (xDelta + yDelta > settings.moveDeltaTreshold) {

            var img = document.createElement('img');

            if (worksCounter === works.length - 1) {
                worksCounter = 0;
            }
            img.src = works[++worksCounter];
            img.style.left = xElement + 'px';
            img.style.top = yElement + 'px';
            partnersImages.appendChild(img);
            startX = null;
            startY = null;
        }
    };

    var handleDown = function(e) {

        var xElement = e.pageX - partnersHover.offsetLeft;
        var yElement = e.pageY - partnersHover.offsetTop - contentOffset;

        if (xElement < 0 || xElement > partnersHover.clientWidth || yElement < 0 || yElement > partnersHover.clientHeight) {
            return;
        }

        var img = document.createElement('img');

        if (worksCounter === works.length - 1) {
            worksCounter = 0;
        }
        img.src = works[++worksCounter];
        img.style.left = xElement + 'px';
        img.style.top = yElement + 'px';
        partnersImages.appendChild(img);
    };

    partnersHover.addEventListener('mousemove', function(e) {
        if (!mobile()) {
            handleMove(e);
        }
    });
    partnersHover.addEventListener('mousedown', function(e) {
        if (mobile()) {
            handleDown(e);
        }
    });

};

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('locked');
});
window.onload = load;