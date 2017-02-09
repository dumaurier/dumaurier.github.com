
/*****************************************************************
 Name: AccessibilityEnhancer
 Description: This object provides methods that can make different
 components accessible by adding ARIA roles and keyboard tabbing
 functionality.
 Usage: In your HTML markup, make sure to add the attribute
 data-a11y="[functionality]", e.g. for elements that are hidden from
 view (like signin/register panels) add: data-a11y="hidden"

 Methods can be referenced via the namespace, e.g.:
 Workopolis.AccessibilityEnhancer.bindExpanders();

******************************************************************/
var Workopolis = Workopolis || {};

 (function ($) {
    'use strict';

    var AccessibilityEnhancer = {

        keyboardKeys: {
            TAB: 9,
            ENTER: 13,
            SPACE: 32,
            ESCAPE: 27,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        },

        attributeMapping: {
            'button': {'role': 'button'},
            'navigation': {'role': 'navigation'},
            'search': {'role': 'search'},
            'expander-content': {'aria-expanded': 'false', 'aria-hidden': 'true'},
            'expander-trigger': {'role': 'button'},
            'hidden-element': {'aria-hidden': 'true', 'tabindex': '-1'},
            'hidden-menu': {'role': 'menu', 'aria-hidden': 'true', 'tabindex': '-1'},
            'hidden-menu-trigger': {'role': 'button', 'aria-expanded': 'false'},
            'presentation': {'role': 'presentation', 'aria-hidden': 'true', 'tabindex': '-1'}
        },

        toggledAttributeMapping: {
            'expander-content': {'aria-expanded': 'true', 'aria-hidden': 'false'},
            'hidden-element': {'aria-hidden': 'false', 'tabindex': '0'},
            'hidden-menu': {'role': 'menu', 'aria-hidden': 'false', 'tabindex': '0'},
            'hidden-menu-trigger': {'role': 'button', 'aria-expanded': 'true'}
        },

        lastFocusedEl: null,

        /******************* FUNCTIONS *********************/

        init:function() {
            this.applyARIA();

            // Bind on click and keydown events
            this.bindExpanders();
            this.bindEscapeKey();
            this.bindDropdownMenu();
        },

        applyARIA: function() {
            var self = this;

            // Loop through all elements that have an attribute data-a11y assigned to them and apply ARIA roles
            for(var value in self.attributeMapping) {
                var currentDataElements = $('[data-a11y="' + value + '"]');
                currentDataElements.each(function(){
                    $(this).attr(self.attributeMapping[value]);
                });
            }
        },

        bindEscapeKey: function () {
            var self = this;

            // Hitting escape key will hide all overlay panels and expanders, by removind class "is-active"
            $('body').on('keydown', function(e) {
                var keyCode = e.which || e.keyCode;
                if(keyCode === 27) {
                    $('.is-active').removeClass('is-active');
                    if(self.lastFocus && self.lastFocus !== undefined)
                        $(self.lastFocus).focus();
                }
            });
        },

        bindExpanders: function() {
           var self = this;

            $('[data-a11y="expander-trigger"]').on('click keydown', function (e) {
                var curExpanderButton = $(this);
                var curEl = self.getElementBySelector(curExpanderButton.data('related-expander'));

                if(!curEl || !self.isValidEventTrigger(e))
                    return;

                curEl.toggleClass('is-active');
                curEl.attr(curEl.hasClass('is-active') ? self.toggledAttributeMapping['expander-content'] : self.attributeMapping['expander-content']);
                curExpanderButton.toggleClass('expanded');

                var hiddenContent = curEl.find('[data-a11y="hidden-element"]');
                hiddenContent.attr(curEl.hasClass('is-active') ? self.toggledAttributeMapping['hidden-element'] : self.attributeMapping['hidden-element']);

                // Send the expand/collapse event to Omniture DTM
                if (typeof CommonDataLayer !== "undefined")
                    CommonDataLayer.expanderClickEvent($('.expander-heading').text());

                return false;
            });
        },

        bindDropdownMenu: function() {
            var self = this;

            // On keyboard focus, show the submenu
            $('[data-a11y="hidden-menu-trigger"]').on('keydown', function (e) {
                var curMenuButton = $(this);
                var keyCode = e.which || e.keyCode;

                switch (keyCode) {
                    case self.keyboardKeys.DOWN:
                        self.toggleMenuVisibility(curMenuButton, true);
                        break;
                    case self.keyboardKeys.ESCAPE:
                    case self.keyboardKeys.UP:
                        self.toggleMenuVisibility(curMenuButton, false);
                        break;
                    default:
                        break;
                 }
            });
        },

        toggleMenuVisibility: function(menuButtonEl, isVisible) {
            //var isVisible = menuButtonEl.hasClass('is-focused');
            var curMenuWrapper = menuButtonEl.parent();
            var curMenuEl = curMenuWrapper.find('[data-a11y="hidden-menu"]');

            curMenuEl.attr(isVisible ? this.toggledAttributeMapping['hidden-menu'] :   this.attributeMapping['hidden-menu']);
            curMenuEl.toggleClass('is-active');
        },

        updateOverlay: function(overlayEl) {
            var self = this,
                focusedElement = overlayEl.find('[data-a11y="focus"]');

            overlayEl.attr(overlayEl.hasClass('is-active') ? self.toggledAttributeMapping['hidden-element'] : self.attributeMapping['hidden-element']);

            // If we need to shift the tabbing within the overlay element
            if(focusedElement && focusedElement !== undefined) {
                self.lastFocus = document.activeElement;
                focusedElement.focus();
            }
        },

        /******************* UTILITY FUNCTIONS *********************/
        isValidEventTrigger: function(e) {
            // Either a mouse click, or a keyboard enter can trigger an event/action
            // left-mouse-click: 1
            // enter key: 13
            // escape key: 27

            var keyCode = e.which || e.keyCode;
            return (keyCode === 1 || keyCode === this.keyboardKeys.ENTER || keyCode === this.keyboardKeys.ESCAPE);
        },

        getElementBySelector: function(selector) {
            var el = $('#' + selector);
            if(!el.length)
                el = $('.' + selector);
            return (el.length ? el : null);
        }

    };

    Workopolis.AccessibilityEnhancer = AccessibilityEnhancer;

}(jQuery));
