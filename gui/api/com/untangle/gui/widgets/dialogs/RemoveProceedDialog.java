/*
 * Copyright (c) 2003-2007 Untangle, Inc.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Untangle, Inc. ("Confidential Information"). You shall
 * not disclose such Confidential Information.
 *
 * $Id$
 */

package com.untangle.gui.widgets.dialogs;


import java.awt.Dialog;
import java.awt.Frame;
import java.awt.Window;

final public class RemoveProceedDialog extends MTwoButtonJDialog {

    public static RemoveProceedDialog factory(Window parentWindow, String applianceName){
        if( parentWindow instanceof Dialog )
            return new RemoveProceedDialog((Dialog)parentWindow, applianceName);
        else if( parentWindow instanceof Frame )
            return new RemoveProceedDialog((Frame)parentWindow, applianceName);
        else
            return null;
    }

    private RemoveProceedDialog(Dialog parentDialog, String applianceName) {
        super(parentDialog);
        init(applianceName);
    }
    private RemoveProceedDialog(Frame parentFrame, String applianceName) {
        super(parentFrame);
        init(applianceName);
    }

    private void init(String applianceName){
        setTitle(applianceName + " Warning");
        messageJLabel.setText("<html><center>" + applianceName + " is about to be removed from the rack.<br>Its settings will be lost and it will stop processing network traffic.<br><br>Would you like to continue removing?</center></html>");
        setVisible(true);
    }

}
