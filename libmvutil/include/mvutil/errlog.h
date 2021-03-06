/**
 * $Id$
 */
#ifndef __ERRLOG_H
#define __ERRLOG_H

#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <semaphore.h>
#include <pthread.h>

#define errstr strerror(errno)

typedef void (*errlog_fatal_func_t) (void* arg);

extern int   _errlog_init(void);
extern void  _errlog_cleanup(void);
extern int   _errlog (char * fmt, char * file, int lineno, int level, char *lpszFmt, ...) __attribute__ ((format (printf, 5, 6)));
extern void* _errlog_null (char * fmt, char * file, int lineno, int level, char *lpszFmt, ...) __attribute__ ((format (printf, 5, 6)));
extern void  _errlog_set_output (FILE * out);
extern void  _errlog_date_toggle (int onoff);
extern void  _errlog_set_fatal_func (errlog_fatal_func_t func);
extern int   _errlog_noprefix (char * fmt, char * file, int lineno, int level, char *lpszFmt, ...) __attribute__ ((format (printf, 5, 6)));
extern void  _errlog_cleanup (void);

#define STD_ERRLOG_PREFIX "ERROR:%s:%i:",__FILE__,__LINE__
#define ERR_FATAL     STD_ERRLOG_PREFIX,ERROR_FATAL_LVL
#define ERR_CRITICAL  STD_ERRLOG_PREFIX,ERROR_CRITICAL_LVL   
#define ERR_WARNING   STD_ERRLOG_PREFIX,ERROR_WARNING_LVL
#define ERR_INFORM    STD_ERRLOG_PREFIX,ERROR_INFORM_LVL

#define errlog(...)              _errlog(__VA_ARGS__)
#define errlog_null(...)         _errlog_null(__VA_ARGS__)
#define errlog_noprefix(...)     _errlog_noprefix(__VA_ARGS__)
#define errlog_set_output(a)     _errlog_set_output(a)
#define errlog_date_toggle(a)    _errlog_date_toggle(a)
#define errlog_set_fatal_func(a) _errlog_set_fatal_func(a)
#define perrlog(str)             _errlog(ERR_CRITICAL,"%s: %s\n",(str),errstr)
#define perrlog_null(str)        errlog_null(ERR_CRITICAL,"%s: %s\n",(str),errstr)
#define errlogargs()             _errlog(ERR_CRITICAL,"Invalid Arguments\n")
#define errlogargs_null()        errlog_null(ERR_CRITICAL,"Invalid Arguments\n")
#define errlogcons()             _errlog(ERR_CRITICAL,"Constraint Failed\n")
#define errlogcons_null()        errlog_null(ERR_CRITICAL,"Constraint Failed\n")
#define errlogmalloc()           _errlog(ERR_FATAL,"malloc: %s\n",errstr)
#define errlogmalloc_null()      errlog_null(ERR_FATAL,"malloc: %s\n",errstr)
#define errlogimpl()             _errlog(ERR_CRITICAL,"Unimplemented\n")
#define errlogimpl_null()        _errlog_null(ERR_CRITICAL,"Unimplemented\n")


#define ERROR_FATAL_LVL     0
#define ERROR_CRITICAL_LVL  1
#define ERROR_WARNING_LVL   2
#define ERROR_INFORM_LVL    3


/**
 * output locks
 * used in debug also
 */
// extern sem_t* output_mutex;
extern pthread_mutex_t _output_mutex;
#define OUT_LOCK()   pthread_mutex_lock( &_output_mutex )
#define OUT_UNLOCK() pthread_mutex_unlock( &_output_mutex )

#endif
