/**
 * Created with JetBrains WebStorm
 * User: brandonxavier
 * Date: 7/14/13
 *

 Copyright 2013 Brandon Xavier (brandonxavier421@gmail.com)

 This file is part of GSequenceTips.

 GSequenceTips is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 GSequenceTips is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with GSequenceTips.  If not, see <http://www.gnu.org/licenses/>.

 */

// vars
var last_tip_username = null;
var next_tip_amount = 1;
var goal_reached = false;
// var version = 10

// Limit goal description as we add some text
cb.settings_choices = [
    { name: 'goal_description', type: 'str', minLength: 1, maxLength: 190 },
    { name: 'goal_value', type: 'int', minValue: 1, maxValue: 100, default: 50 },
    { name: 'order', type: 'choice',
        choice1: 'ascending',
        choice2: 'descending',
        default: 'ascending' }
];


cb.onTip(
    function (tip) {
        var diff = tip['amount'];
        while ( (diff > 0) && (!checkGoalReached()) ) {
            diff -= next_tip_amount;
            if ( diff >= 0 ) {
                // We set the last tipper only if the tip was counted
                // (not optimal to do it as many times as the tip counted though)
                last_tip_username = tip['from_user'];
                setNextTipNeeded();
            }
        }

        update_subject();
        cb.drawPanel();
    }
);


cb.onDrawPanel(
    function (user) {
        if ( checkGoalReached() ) {
            return {
                'template': '3_rows_11_21_31',
                'row1_value': 'Goal reached!',
                'row2_value': '',
                'row3_value': 'Thanks to all tippers'
            };
        } else {
            if ( isAscendingOrder() ) {
                return {
                    'template': '3_rows_of_labels',
                    'row1_label': 'Next Tip Needed:',
                    'row1_value': next_tip_amount,
                    'row2_label': 'Last Tip From:',
                    'row2_value': format_username( last_tip_username ),
                    'row3_label': 'Ascending:',
                    'row3_value': 'From 1 to ' + cb.settings.goal_value
                };
            } else {
                return {
                    'template': '3_rows_of_labels',
                    'row1_label': 'Next Tip Needed:',
                    'row1_value': next_tip_amount,
                    'row2_label': 'Last Tip From:',
                    'row2_value': format_username( last_tip_username ),
                    'row3_label': 'Descending:',
                    'row3_value': 'From ' + cb.settings.goal_value + ' to 0'
                };
            }
        }
    }
);

// helper functions
function update_subject() {
    if ( goal_reached ) {
        return;
    }

    var new_subject = "";
    if ( checkGoalReached() ) {
        new_subject = cb.settings.goal_description + " [Goal reached! Thanks to all tippers.]";
        goal_reached = true;
    } else {
        if ( isAscendingOrder() ) {
            new_subject = cb.settings.goal_description +
                " [Tip in ascending order from 1 to " + cb.settings.goal_value + ". Next tip needed: " + next_tip_amount + "]";
        } else {
            new_subject = cb.settings.goal_description +
                " [Tip in descending order from " + cb.settings.goal_value + " to 0. Next tip needed: " + next_tip_amount + "]";
        }
    }

    cb.changeRoomSubject( new_subject );
}

function format_username(val) {
    if ( val === null ) {
        return "--";
    } else {
        return val.substring( 0, 12 );
    }
}

function isAscendingOrder() {
    return (cb.settings.order == 'ascending');
}

function setNextTipNeeded() {
    if ( isAscendingOrder() ) {
        next_tip_amount++;
    } else {
        next_tip_amount--;
    }
}

function checkGoalReached() {
    if ( isAscendingOrder() ) {
        return (next_tip_amount > cb.settings.goal_value);
    } else {
        return (next_tip_amount <= 0);
    }
}

function init() {
    if ( isAscendingOrder() ) {
        next_tip_amount = 1;
    } else {
        next_tip_amount = cb.settings.goal_value;
    }

    update_subject();
}

init();

