// utils/LinkedIn/scheduler.js
import ScheduledPost from '../../models/LinkedIn/ScheduledPost.js';
import LinkedInOrganization from '../../models/LinkedIn/Organization.js';
import schedule from 'node-schedule';
import * as linkedinService from '../../services/Linkedinservice/linkedin.service.js';
import fs from 'fs/promises';

// In-memory registry of active jobs
const scheduledJobs = new Map();

/** Helper: pretty-print an invocation time */
const fmt = (d) => d ? new Date(d).toISOString() : '—';

/** Optional: call this anywhere to see what’s queued */
export const listScheduledJobs = () => {
  console.log('📋  Active scheduled jobs:');
  scheduledJobs.forEach((job, name) =>
    console.log(`   • ${name} -> next at ${fmt(job.nextInvocation())}`)
  );
};

/** Initialise (or re-initialise) jobs – run once after the DB is ready */
export const initializeScheduledJobs = async () => {
  try {

    // Fetch only future posts that are still ‘scheduled’
    const scheduledPosts = await ScheduledPost.find({
      status: 'scheduled',
      scheduleTime: { $gt: new Date() }
    })
      .populate({
        path: 'orgIds.orgId',
        select: '+accessToken organizationId' // make sure token & org ref are available
      });


    for (const post of scheduledPosts) {
      // --- one closure per post -------------
      const postJob = async () => {
        console.log(`⏱️  [${post.jobName}] firing at ${fmt(new Date())}`);

        const results = [];
        let filesToPost = [];

        // Read any stored images (if present)
        if (post.imageFiles?.length) {
          for (const fileInfo of post.imageFiles) {
            try {
              const buffer = await fs.readFile(fileInfo.path);
              filesToPost.push({
                buffer,
                mimetype: fileInfo.mimetype,
                originalname: fileInfo.filename
              });
            } catch (err) {
              console.error(`   ⚠️  could not read ${fileInfo.path}:`, err);
            }
          }
        }

        // Iterate per-org inside the scheduled post
        for (const { orgId } of post.orgIds) {
          if (!orgId) {
            results.push({ status: 'failed', error: 'orgId missing' });
            continue;
          }

          const linkedInOrg = await LinkedInOrganization.findById(orgId._id);
          if (!linkedInOrg?.accessToken) {
            console.error(`   ❌ no token for org ${orgId._id}`);
            await ScheduledPost.updateOne(
              { _id: post._id, 'orgIds.orgId': orgId._id },
              { $set: { 'orgIds.$.status': 'failed', 'orgIds.$.error': 'token missing' } }
            );
            results.push({ status: 'failed', orgId: orgId._id, error: 'token missing' });
            continue;
          }

          try {
            const result = await linkedinService.postToLinkedInWithFilesUGC(
              linkedInOrg,
              post.message,
              post.imageUrls ?? [],
              filesToPost
            );

            console.log(`   ✅ posted for org ${orgId._id} -> ${result.id}`);

            await ScheduledPost.updateOne(
              { _id: post._id, 'orgIds.orgId': orgId._id },
              {
                $set: {
                  'orgIds.$.status': 'posted',
                  'orgIds.$.linkedinPostId': result.id,
                  'orgIds.$.postedAt': new Date()
                }
              }
            );
            results.push({ status: 'success', orgId: orgId._id, result });
          } catch (err) {
            console.error(`   ❌ post failed for org ${orgId._id}:`, err.message);
            await ScheduledPost.updateOne(
              { _id: post._id, 'orgIds.orgId': orgId._id },
              {
                $set: {
                  'orgIds.$.status': 'failed',
                  'orgIds.$.error': err.message ?? 'post failed'
                }
              }
            );
            results.push({ status: 'failed', orgId: orgId._id, error: err.message });
          }
        }

        // Clean up temp files (if any)
        if (post.imageFiles?.length) {
          await Promise.all(
            post.imageFiles.map(async (f) => {
              try {
                await fs.unlink(f.path);
                console.log(`   🧹 deleted ${f.filename}`);
              } catch (err) {
                console.error(`   ⚠️  could not delete ${f.path}:`, err);
              }
            })
          );
        }

        // Mark overall post status
        const allOK = results.every((r) => r.status === 'success');
        const someFail = results.some((r) => r.status === 'failed');
        await ScheduledPost.findByIdAndUpdate(post._id, {
          status: allOK ? 'posted' : someFail ? 'failed' : 'posted',
          lastProcessedAt: new Date()
        });

        scheduledJobs.delete(post.jobName);
      };
      // --- /closure --------------------------

      // Skip if the scheduled time is already passed (failsafe)
      if (post.scheduleTime <= new Date()) {
        console.warn(`⚠️  discarding outdated job ${post.jobName}`);
        await ScheduledPost.findByIdAndUpdate(post._id, {
          status: 'failed',
          error: 'schedule time passed before server restart'
        });
        continue;
      }

      // (Re)create the cron job
      const job = schedule.scheduleJob(post.jobName, post.scheduleTime, postJob);
      if (!job) {
        console.error(`❌ could not reschedule ${post.jobName}`);
        await ScheduledPost.findByIdAndUpdate(post._id, {
          status: 'failed',
          error: 'reschedule failed'
        });
        continue;
      }

      scheduledJobs.set(post.jobName, job);
    }

    // Final summary
  } catch (err) {
    console.error('🚨  initialiseScheduledJobs crashed:', err);
  }
};

// Export for controller usage
export { scheduledJobs };
