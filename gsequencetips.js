/**
 * Created with JetBrains WebStorm
 * User: brandonxavier
 * Date: 7/14/13
 *

 * The vast majority of the credit for this goes to the original
 * authors of the sequence tips app: Cliche123 and Nolidoux, and of
 * course to the creators of the wonderful next[0-9]+ emotes.
 *
 * Emote (graphic) options added by brandonxavier
 *

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
        default: 'ascending' },
    { name: 'useGraphics', type: 'choice',
        choice1: 'yes',
        choice2: 'no',
        default: 'yes',
        label: 'Use next?? graphics'}
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

cb.onMessage( function (msg) {
    if ( msg['m'].match( /^\/gon/i ) != null ) {
        msg['X-Spam'] = true;
        cb.settings.useGraphics = "yes";
        cb.chatNotice( "Graphics: On", cb.room_slug );
    } else {
        if ( msg['m'].match( /^\/goff/i ) != null ) {
            msg['X-Spam'] = true;
            cb.settings.useGraphics = "no";
            cb.chatNotice( "Graphics: Off", cb.room_slug );
        }
    }
    return msg;
} );

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

    if ( cb.settings.useGraphics == "yes" && !goal_reached ) {
        cb.chatNotice( ":next" + next_tip_amount );
    }

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

    cb.chatNotice( "You can turn graphics on or off by typing /gon or /goff",
        cb.room_slug );

    update_subject();
}

if ( !!AppDevKit == false )
    init();