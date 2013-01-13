import os
import BaseHTTPServer
import SimpleHTTPServer


BASE_PATH = os.getcwd()

class RequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    """serve index.html page instead of 404 for unknown locations"""
    def send_head(self):
        """mostly copied from SimpleHTTPServer.send_head
          * removed directory listing
          * serve index.html is path doesnt exist
        """
        path = self.translate_path(self.path)

        if (not os.path.exists(path)) or path == BASE_PATH:
            path = 'index.html'

        ctype = self.guess_type(path)

        f = None
        try:
            # Always read in binary mode. Opening files in text mode may cause
            # newline translations, making the actual size of the content
            # transmitted *less* than the content-length!
            f = open(path, 'rb')
        except IOError as ex:
            self.send_error(404, "File not found" + str(ex))
            return None
        self.send_response(200)
        self.send_header("Content-type", ctype)
        fs = os.fstat(f.fileno())
        self.send_header("Content-Length", str(fs[6]))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()
        return f


if __name__ == '__main__':
    BaseHTTPServer.test(RequestHandler, BaseHTTPServer.HTTPServer)
