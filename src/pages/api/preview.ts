/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Prismic from '@prismicio/client';
import { Document } from '@prismicio/client/types/documents';
import { NextApiRequest, NextApiResponse } from 'next';

const linkResolver = (doc: Document): string => {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }

  return '/';
};

export const createClientOptions = (req = null, prismicAccessToken = null) => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken
    ? { accessToken: prismicAccessToken }
    : {};

  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

// Client method to query from the Prismic repo
export const Client = (req = null) => {
  return Prismic.client(
    process.env.PRISMIC_API_ENDPOINT,
    createClientOptions(req, process.env.PRISMIC_ACCESS_TOKEN)
  );
};

const Preview = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token: ref, documentId } = req.query as any;
  const redirectUrl = await Client(req)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}` });
  res.end();
};

export default Preview;
