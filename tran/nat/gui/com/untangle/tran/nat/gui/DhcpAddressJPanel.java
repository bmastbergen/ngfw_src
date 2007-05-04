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

package com.untangle.tran.nat.gui;


import java.util.*;
import javax.swing.*;
import javax.swing.event.*;
import javax.swing.table.*;

import com.untangle.gui.transform.*;
import com.untangle.gui.util.*;
import com.untangle.gui.widgets.editTable.*;
import com.untangle.mvvm.networking.DhcpLeaseRule;
import com.untangle.mvvm.tran.*;
import com.untangle.mvvm.tran.firewall.*;
import com.untangle.tran.nat.*;

public class DhcpAddressJPanel extends MEditTableJPanel{


    public DhcpAddressJPanel() {
        super(true, true);
        super.setFillJButtonEnabled( false );
        super.setInsets(new java.awt.Insets(4, 4, 2, 2));
        super.setTableTitle("");
        super.setDetailsTitle("");
        super.setAddRemoveEnabled(true);
        super.setRefreshJButtonEnabled(true);

        // create actual table model
        AddressTableModel addressTableModel = new AddressTableModel();
        this.setTableModel( addressTableModel );

    }





    class AddressTableModel extends MSortedTableModel<Object>{


        private static final int  T_TW = Util.TABLE_TOTAL_WIDTH;
        private static final int  C0_MW = Util.STATUS_MIN_WIDTH; /* status */
        private static final int  C1_MW = Util.LINENO_MIN_WIDTH; /* # - invisible */
        private static final int  C2_MW = 130;  /* MAC address */
        private static final int  C3_MW = 130;  /* current IP */
        private static final int  C4_MW = 130;  /* current static target IP */
        private static final int  C5_MW = 100;  /* hostname */
        private static final int  C6_MW = 150;  /* current lease end */
        private static final int  C7_MW = 120;  /* category */

        private final int C8_MW = Util.chooseMax(T_TW - (C0_MW + C2_MW + C3_MW + C4_MW + C5_MW + C6_MW + C7_MW), 120); /* description */




        public TableColumnModel getTableColumnModel(){

            DefaultTableColumnModel tableColumnModel = new DefaultTableColumnModel();
            //                                 #   min    rsz    edit   remv   desc   typ            def
            addTableColumn( tableColumnModel,  0,  C0_MW, false, false, true, false, String.class,  null, sc.TITLE_STATUS );
            addTableColumn( tableColumnModel,  1,  C1_MW, false, false, true,  false, Integer.class, null, sc.TITLE_INDEX );
            addTableColumn( tableColumnModel,  2,  C2_MW, true,  true,  false, false, String.class, "00:01:23:45:67:89", sc.html("<b>MAC<br>address</b>") );
            addTableColumn( tableColumnModel,  3,  C3_MW, true,  false, false, false, IPaddrString.class, "[not connected]", sc.html("current<br>IP address") );
            addTableColumn( tableColumnModel,  4,  C4_MW, true,  true,  false, false, IPaddrString.class, "1.2.3.4", sc.html("<b>target static<br>IP address</b>") );
            addTableColumn( tableColumnModel,  5,  C5_MW, true,  false, false, false, String.class, "[not connected]", sc.html("current<br>hostname") );
            addTableColumn( tableColumnModel,  6,  C6_MW, true,  false, false, false, Date.class,   "[not connected]", sc.html("current<br>lease end") );
            addTableColumn( tableColumnModel,  7,  C7_MW, true,  true,  true, false, String.class, sc.EMPTY_CATEGORY, sc.TITLE_CATEGORY);
            addTableColumn( tableColumnModel,  8,  C8_MW, true,  true,  false, true,  String.class, sc.EMPTY_DESCRIPTION, sc.TITLE_DESCRIPTION);
            addTableColumn( tableColumnModel,  9,  10,    false, false, true,  false, DhcpLeaseRule.class, null, "");
            return tableColumnModel;
        }


        public void generateSettings(Object settings, Vector<Vector> tableVector, boolean validateOnly) throws Exception {
            NatCommonSettings natSettings = (NatCommonSettings) settings;
            List elemList = new ArrayList(tableVector.size());
            DhcpLeaseRule newElem = null;
            int rowIndex = 0;

            for( Vector rowVector : tableVector ){
                rowIndex++;
                newElem = (DhcpLeaseRule) rowVector.elementAt(9);
                try{ newElem.setMacAddress( MACAddress.parse( (String)rowVector.elementAt(2)) ); }
                catch(Exception e){ throw new Exception("Invalid \"MAC address\" in row: " + rowIndex); }
                try{ newElem.setStaticAddress( IPNullAddr.parse( ((IPaddrString)rowVector.elementAt(4)).getString()) ); }
                catch(Exception e){ throw new Exception("Invalid \"target static IP address\" in row: " + rowIndex); }
                newElem.setCategory( (String) rowVector.elementAt(7) );
                newElem.setDescription( (String) rowVector.elementAt(8) );
                elemList.add(newElem);
            }

            // SAVE SETTINGS ////////
            if( !validateOnly ){
                natSettings.setDhcpLeaseList(elemList);
            }
        }



        public Vector<Vector> generateRows(Object settings) {
            NatCommonSettings natSettings = (NatCommonSettings) settings;
            List<DhcpLeaseRule> dhcpLeaseList = (List<DhcpLeaseRule>) natSettings.getDhcpLeaseList();
            Vector<Vector> allRows = new Vector<Vector>(dhcpLeaseList.size());
            Vector tempRow = null;
            int rowIndex = 0;

            for( DhcpLeaseRule leaseRule : dhcpLeaseList ){
                rowIndex++;
                tempRow = new Vector(10);
                tempRow.add( super.ROW_SAVED );
                tempRow.add( rowIndex );
                tempRow.add( leaseRule.getMacAddress().toString() );
                IPaddrString currentIPaddrString = new IPaddrString(leaseRule.getCurrentAddress());
                currentIPaddrString.setEmptyString("[not connected]");
                tempRow.add( currentIPaddrString );
                IPaddrString targetIPaddrString = new IPaddrString(leaseRule.getStaticAddress());
                targetIPaddrString.setEmptyString("none (use current)");
                tempRow.add( targetIPaddrString );
                String hostname = leaseRule.getHostname();
                if(hostname.equals("*"))
                    tempRow.add( "[no hostname requested]" );
                else if(hostname.equals(""))
                    tempRow.add("[not connected]");
                else
                    tempRow.add(hostname);
                tempRow.add( (leaseRule.getEndOfLease()==null?new Date(1l):leaseRule.getEndOfLease()) );
                tempRow.add( leaseRule.getCategory() );
                tempRow.add( leaseRule.getDescription() );
                tempRow.add( leaseRule );
                allRows.add( tempRow );
            }
            return allRows;
        }

    }

}
