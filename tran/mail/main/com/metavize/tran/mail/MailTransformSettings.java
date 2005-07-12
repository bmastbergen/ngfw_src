/*
 * Copyright (c) 2005 Metavize Inc.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Metavize Inc. ("Confidential Information").  You shall
 * not disclose such Confidential Information.
 *
 * $Id$
 */

package com.metavize.tran.mail;

import java.io.Serializable;

import com.metavize.mvvm.security.Tid;

/**
 * Mail casing settings.
 *
 * @author <a href="mailto:amread@nyx.net">Aaron Read</a>
 * @version 1.0
 * @hibernate.class
 * table="TR_MAIL_SETTINGS"
 */
public class MailTransformSettings implements Serializable
{
    private static final long serialVersionUID = -6466793822226799781L;


    private Long id;
    private Tid tid;

    private boolean smtpEnabled = true;
    private boolean popEnabled = true;
    private boolean imapEnabled = true;

    // constructors -----------------------------------------------------------

    public MailTransformSettings() { }

    // accessors --------------------------------------------------------------

    /**
     * @hibernate.id
     * column="SETTINGS_ID"
     * generator-class="native"
     */
    private Long getId()
    {
        return id;
    }

    private void setId(Long id)
    {
        this.id = id;
    }

    /**
     * Transform id for these settings.
     *
     * @return tid for these settings.
     * @hibernate.many-to-one
     * column="TID"
     * unique="true"
     * not-null="true"
     */
    public Tid getTid()
    {
        return tid;
    }

    public void setTid(Tid tid)
    {
        this.tid = tid;
    }

    /**
     * Enabled status of SMTP casing.
     *
     * @return true if SMTP casing is enabled, false otherwise.
     * @hibernate.property
     * column="SMTP_ENABLED"
     * not-null="true"
     */
    public boolean isSmtpEnabled()
    {
        return smtpEnabled;
    }

    public void setSmtpEnabled(boolean smtpEnabled)
    {
        this.smtpEnabled = smtpEnabled;
    }

    /**
     * Enabled status of POP casing.
     *
     * @return true of POP casing is enabled, false otherwise.
     * @hibernate.property
     * column="POP_ENABLED"
     * not-null="true"
     */
    public boolean isPopEnabled()
    {
        return popEnabled;
    }

    public void setPopEnabled(boolean popEnabled)
    {
        this.popEnabled = popEnabled;
    }

    /**
     * Enabled status of IMAP casing.
     *
     * @return true of IMAP casing is enabled, false otherwise.
     * @hibernate.property
     * column="IMAP_ENABLED"
     * not-null="true"
     */
    public boolean isImapEnabled()
    {
        return imapEnabled;
    }

    public void setImapEnabled(boolean imapEnabled)
    {
        this.imapEnabled = imapEnabled;
    }
}
